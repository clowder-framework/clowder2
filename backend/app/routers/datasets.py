import datetime
import hashlib
import io
import os
import shutil
import tempfile
import zipfile
from collections.abc import Mapping, Iterable
from typing import List, Optional

from beanie import PydanticObjectId
from beanie.operators import Or
from bson import ObjectId
from bson import json_util
from elasticsearch import Elasticsearch
from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi import (
    File,
    UploadFile,
    Response,
    Request,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from minio import Minio
from pika.adapters.blocking_connection import BlockingChannel
from rocrate.model.person import Person
from rocrate.rocrate import ROCrate

from app import dependencies
from app.config import settings
from app.deps.authorization_deps import Authorization
from app.keycloak_auth import (
    get_token,
    get_user,
    get_current_user,
)
from app.models.authorization import AuthorizationDB, RoleType
from app.models.datasets import (
    DatasetBase,
    DatasetIn,
    DatasetDB,
    DatasetOut,
    DatasetPatch,
    DatasetDBViewList,
)
from app.models.files import FileOut, FileDB, FileDBViewList
from app.models.folders import FolderOut, FolderIn, FolderDB, FolderDBViewList
from app.models.metadata import MetadataDB
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut
from app.rabbitmq.listeners import submit_dataset_job
from app.routers.files import add_file_entry, remove_file_entry
from app.search.connect import (
    delete_document_by_id,
)
from app.search.index import index_dataset

router = APIRouter()
security = HTTPBearer()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


def _describe_zip_contents(file_list: list):
    """Traverse a list of zipfile entries and create a dictionary structure like so:
    {
        ""__CLOWDER_FILE_LIST__"": ['list', 'of', 'root', 'files'],
        "folder_1": {
            ""__CLOWDER_FILE_LIST__"": ['list', 'of', 'folder_1', 'files']
        },
        "folder_2": {
            ""__CLOWDER_FILE_LIST__"": ['list', 'of', 'folder_2', 'files'],
            "subfolder_3": {
                ""__CLOWDER_FILE_LIST__"": ['list', 'of', subfolder_3', 'files']
            },
        },
        ...
    }
    """
    empty_entry = {"__CLOWDER_FILE_LIST__": []}

    def path_parts_to_dict(entries, last_is_file=True):
        if len(entries) == 1:
            if last_is_file:
                return {"__CLOWDER_FILE_LIST__": [entries[0]]}
            else:
                return {entries[0]: empty_entry.copy()}
        else:
            return {entries[0]: path_parts_to_dict(entries[1:])}

    def nested_update(target_dict, update_dict):
        for k, v in update_dict.items():
            if isinstance(v, Mapping):
                current = target_dict[k] if k in target_dict else {}
                target_dict[k] = nested_update(current, v)
            elif isinstance(v, Iterable):
                current = target_dict[k] if k in target_dict else []
                if v not in current:
                    target_dict[k] = list(set(current + v))
            else:
                target_dict[k] = v
        return target_dict

    zip_structure = empty_entry.copy()
    for entry in file_list:
        if "__MACOSX" in entry or entry.endswith(".DS_Store"):
            # TODO: These are not visible in OSX 10.3+ and hard to delete. Leaving this in to minimize user frustration.
            continue
        if entry.endswith(os.path.sep):
            # this is a folder, not a file
            folder_parts = os.path.normpath(entry).split(os.path.sep)
            if len(folder_parts) > 1:
                folder_dict = path_parts_to_dict(folder_parts, False)
                zip_structure = nested_update(zip_structure, folder_dict)
            elif entry not in zip_structure:
                zip_structure[entry.rstrip(os.path.sep)] = empty_entry.copy()
            continue

        parts = os.path.normpath(entry).split(os.path.sep)
        if len(parts) > 1:
            parts_dict = path_parts_to_dict(parts)
            zip_structure = nested_update(zip_structure, parts_dict)
        else:
            zip_structure["__CLOWDER_FILE_LIST__"].append(entry)

    return zip_structure


async def _create_folder_structure(
    dataset_id: str,
    contents: dict,
    folder_path: str,
    folder_lookup: dict,
    user: UserOut,
    parent_folder_id: Optional[str] = None,
):
    """Recursively create folders encountered in folder_path until the target folder is created.
    Arguments:
        - dataset_id: destination dataset
        - contents: list of contents in folder (see _describe_zip_contents() for structure)
        - folder_path: full path to folder from dataset root (e.g. folder/subfolder/subfolder2)
        - folder_lookup: mapping from folder_path to folder_id for reference later
        - parent_folder_id: destination folder
    """
    for k, v in contents.items():
        if k == "__CLOWDER_FILE_LIST__":
            continue

        # Create the folder
        folder_dict = {
            "dataset_id": dataset_id,
            "name": k,
            "parent_folder": parent_folder_id,
        }
        folder_db = FolderDB(**folder_dict, creator=user)
        await folder_db.insert()

        # Store ID and call recursively on child folders
        new_folder_path = folder_path + os.path.sep + k
        folder_lookup[new_folder_path] = folder_db.id
        if isinstance(v, Mapping):
            folder_lookup = await _create_folder_structure(
                dataset_id, v, new_folder_path, folder_lookup, user, folder_db.id
            )

    return folder_lookup


async def _get_folder_hierarchy(
    folder_id: str,
    hierarchy: str,
):
    """Generate a string of nested path to folder for use in zip file creation."""
    folder = await FolderDB.get(PydanticObjectId(folder_id))
    hierarchy = folder.name + "/" + hierarchy
    if folder.parent_folder is not None:
        hierarchy = await _get_folder_hierarchy(folder.parent_folder, hierarchy)
    return hierarchy


@router.post("", response_model=DatasetOut)
async def save_dataset(
    dataset_in: DatasetIn,
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    dataset = DatasetDB(**dataset_in.dict(), creator=user)
    await dataset.insert()

    # Create authorization entry
    await AuthorizationDB(
        dataset_id=dataset.id,
        role=RoleType.OWNER,
        creator=user.email,
    ).save()

    # Add new entry to elasticsearch
    await index_dataset(es, DatasetOut(**dataset.dict()), [user.email])
    return dataset.dict()


@router.get("", response_model=List[DatasetOut])
async def get_datasets(
    user_id=Depends(get_user),
    skip: int = 0,
    limit: int = 10,
    mine: bool = False,
):
    if mine:
        datasets = await DatasetDBViewList.find(
            DatasetDBViewList.creator.email == user_id,
            sort=(-DatasetDBViewList.created),
            skip=skip,
            limit=limit,
        ).to_list()
    else:
        datasets = await DatasetDBViewList.find(
            Or(
                DatasetDBViewList.creator.email == user_id,
                DatasetDBViewList.auth.user_ids == user_id,
            ),
            sort=(-DatasetDBViewList.created),
            skip=skip,
            limit=limit,
        ).to_list()

    return [dataset.dict() for dataset in datasets]


@router.get("/{dataset_id}", response_model=DatasetOut)
async def get_dataset(
    dataset_id: str,
    allow: bool = Depends(Authorization("viewer")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        return dataset.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/files", response_model=List[FileOut])
async def get_dataset_files(
    dataset_id: str,
    folder_id: Optional[str] = None,
    user_id=Depends(get_user),
    allow: bool = Depends(Authorization("viewer")),
    skip: int = 0,
    limit: int = 10,
):
    query = [
        FileDBViewList.dataset_id == ObjectId(dataset_id),
        Or(
            FileDBViewList.creator.email == user_id,
            FileDBViewList.auth.user_ids == user_id,
        ),
    ]
    if folder_id is not None:
        query.append(FileDBViewList.folder_id == ObjectId(folder_id))
    files = await FileDBViewList.find(*query).skip(skip).limit(limit).to_list()
    return [file.dict() for file in files]


@router.patch("/{dataset_id}/thumbnail/{thumbnail_id}", response_model=DatasetOut)
async def add_dataset_thumbnail(
    dataset_id: str,
    thumbnail_id: str,
    allow: bool = Depends(Authorization("editor")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        dataset.thumbnail_id = thumbnail_id
        await dataset.save()

        return dataset.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.put("/{dataset_id}", response_model=DatasetOut)
async def edit_dataset(
    dataset_id: str,
    dataset_info: DatasetBase,
    user=Depends(get_current_user),
    es=Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        # TODO: Refactor this with permissions checks etc.
        dataset.update(dataset_info)
        dataset.modified = datetime.datetime.utcnow()
        await dataset.save()

        # Update entry to the dataset index
        await index_dataset(es, DatasetOut(**dataset.dict()), update=True)
        return dataset.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.patch("/{dataset_id}", response_model=DatasetOut)
async def patch_dataset(
    dataset_id: str,
    dataset_info: DatasetPatch,
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        # TODO: Update method not working properly
        if dataset_info.name is not None:
            dataset.name = dataset_info.name
        if dataset_info.description is not None:
            dataset.description = dataset_info.description
        dataset.modified = datetime.datetime.utcnow()
        await dataset.save()

        # Update entry to the dataset index
        await index_dataset(es, DatasetOut(**dataset.dict()), update=True)
        return dataset.dict()


@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        # delete from elasticsearch
        delete_document_by_id(es, "clowder", dataset_id)
        # delete dataset first to minimize files/folder being uploaded to a delete dataset
        await dataset.delete()
        await MetadataDB.find(
            MetadataDB.resource.resource_id == PydanticObjectId(dataset_id)
        ).delete()
        async for file in FileDB.find(
            FileDB.dataset_id == PydanticObjectId(dataset_id)
        ):
            await remove_file_entry(file.id, fs, es)
        await FolderDB.find(
            FolderDB.dataset_id == PydanticObjectId(dataset_id)
        ).delete()
        await AuthorizationDB.find(
            AuthorizationDB.dataset_id == ObjectId(dataset_id)
        ).delete()
        return {"deleted": dataset_id}
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/folders", response_model=FolderOut)
async def add_folder(
    dataset_id: str,
    folder_in: FolderIn,
    user=Depends(get_current_user),
    allow: bool = Depends(Authorization("uploader")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        parent_folder = folder_in.parent_folder
        if parent_folder is not None:
            if (await FolderDB.get(PydanticObjectId(parent_folder))) is None:
                raise HTTPException(
                    status_code=400, detail=f"Parent folder {parent_folder} not found"
                )
        new_folder = FolderDB(
            **folder_in.dict(), creator=user, dataset_id=PyObjectId(dataset_id)
        )
        await new_folder.insert()
        return new_folder.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/folders", response_model=List[FolderOut])
async def get_dataset_folders(
    dataset_id: str,
    parent_folder: Optional[str] = None,
    user_id=Depends(get_user),
    allow: bool = Depends(Authorization("viewer")),
    skip: int = 0,
    limit: int = 10,
):
    if (await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        query = [
            FolderDBViewList.dataset_id == ObjectId(dataset_id),
            Or(
                FolderDBViewList.creator.email == user_id,
                FolderDBViewList.auth.user_ids == user_id,
            ),
        ]
        if parent_folder is not None:
            query.append(FolderDBViewList.parent_folder == ObjectId(parent_folder))
        else:
            query.append(FolderDBViewList.parent_folder == None)
        folders = await FolderDBViewList.find(*query).skip(skip).limit(limit).to_list()
        return [folder.dict() for folder in folders]
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.delete("/{dataset_id}/folders/{folder_id}")
async def delete_folder(
    dataset_id: str,
    folder_id: str,
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if (folder := await FolderDB.get(PydanticObjectId(folder_id))) is not None:
            # delete current folder and files
            async for file in FileDB.find(FileDB.folder_id == ObjectId(folder_id)):
                await remove_file_entry(file.id, fs, es)

            # recursively delete child folder and files
            async def _delete_nested_folders(parent_folder_id):
                while (
                    await FolderDB.find_one(
                        FolderDB.dataset_id == ObjectId(dataset_id),
                        FolderDB.parent_folder == ObjectId(parent_folder_id),
                    )
                ) is not None:
                    async for subfolder in FolderDB.find(
                        FolderDB.dataset_id == PydanticObjectId(dataset_id),
                        FolderDB.parent_folder == PydanticObjectId(parent_folder_id),
                    ):
                        async for file in FileDB.find(FileDB.folder_id == subfolder.id):
                            await remove_file_entry(file.id, fs, es)
                        await _delete_nested_folders(subfolder.id)
                        await subfolder.delete()

            await _delete_nested_folders(folder_id)
            await folder.delete()
            return {"deleted": folder_id}
        else:
            raise HTTPException(status_code=404, detail=f"Folder {folder_id} not found")
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/files", response_model=FileOut)
async def save_file(
    dataset_id: str,
    folder_id: Optional[str] = None,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
    es=Depends(dependencies.get_elasticsearchclient),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    credentials: HTTPAuthorizationCredentials = Security(security),
    allow: bool = Depends(Authorization("uploader")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if user is None:
            raise HTTPException(
                status_code=401, detail=f"User not found. Session might have expired."
            )

        new_file = FileDB(name=file.filename, creator=user, dataset_id=dataset.id)

        if folder_id is not None:
            if (folder := await FolderDB.get(PydanticObjectId(folder_id))) is not None:
                new_file.folder_id = folder.id
            else:
                raise HTTPException(
                    status_code=404, detail=f"Folder {folder_id} not found"
                )

        access_token = credentials.credentials
        await add_file_entry(
            new_file,
            user,
            fs,
            es,
            rabbitmq_client,
            access_token,
            file.file,
            content_type=file.content_type,
        )
        return new_file.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/createFromZip", response_model=DatasetOut)
async def create_dataset_from_zip(
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    token: str = Depends(get_token),
):
    if file.filename.endswith(".zip") == False:
        raise HTTPException(status_code=404, detail=f"File is not a zip file")

    # Read contents of zip file into temporary location
    with tempfile.TemporaryFile() as tmp_zip:
        tmp_zip.write(file.file.read())

        with zipfile.ZipFile(tmp_zip, "r") as zip_file:
            zip_contents = zip_file.namelist()
            zip_directory = _describe_zip_contents(zip_contents)

        # Create dataset
        dataset_in = {
            "name": file.filename.rstrip(".zip"),
            "description": "Uploaded as %s" % file.filename,
        }
        dataset = DatasetDB(**dataset_in, creator=user)
        dataset.save()

        # Create folders
        folder_lookup = await _create_folder_structure(
            dataset.id, zip_directory, "", {}, user
        )

        # Go back through zipfile, this time uploading files to folders
        with zipfile.ZipFile(tmp_zip, "r") as zip_file:
            for entry in zip_contents:
                if "__MACOSX" in entry or entry.endswith(".DS_Store"):
                    # TODO: These are not visible in OSX 10.3+ and hard to delete. Leaving this in to minimize user frustration.
                    continue

                # Create temporary file and upload
                if not entry.endswith(os.path.sep):
                    filename = os.path.basename(entry)
                    foldername = os.path.sep + os.path.dirname(entry)
                    extracted = zip_file.extract(entry, path="/tmp")
                    if foldername in folder_lookup:
                        folder_id = folder_lookup[foldername]
                        new_file = FileDB(
                            name=filename,
                            creator=user,
                            dataset_id=dataset.id,
                            folder_id=folder_id,
                        )
                    else:
                        new_file = FileDB(
                            name=filename, creator=user, dataset_id=dataset.id
                        )
                    with open(extracted, "rb") as file_reader:
                        await add_file_entry(
                            new_file,
                            user,
                            fs,
                            es,
                            rabbitmq_client,
                            token,
                            file_reader,
                        )
                    if os.path.isfile(extracted):
                        os.remove(extracted)

    return dataset.dict()


@router.get("/{dataset_id}/download", response_model=DatasetOut)
async def download_dataset(
    dataset_id: str,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    allow: bool = Depends(Authorization("viewer")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        current_temp_dir = tempfile.mkdtemp(prefix="rocratedownload")
        crate = ROCrate()
        user_full_name = user.first_name + " " + user.last_name
        user_crate_id = str(user.id)
        crate.add(Person(crate, user_crate_id, properties={"name": user_full_name}))

        manifest_path = os.path.join(current_temp_dir, "manifest-md5.txt")
        bagit_path = os.path.join(current_temp_dir, "bagit.txt")
        bag_info_path = os.path.join(current_temp_dir, "bag-info.txt")
        tagmanifest_path = os.path.join(current_temp_dir, "tagmanifest-md5.txt")

        with open(manifest_path, "w") as f:
            pass  # Create empty file so no errors later if the dataset is empty

        with open(bagit_path, "w") as f:
            f.write("Bag-Software-Agent: clowder.ncsa.illinois.edu" + "\n")
            f.write("Bagging-Date: " + str(datetime.datetime.now()) + "\n")

        with open(bag_info_path, "w") as f:
            f.write("BagIt-Version: 0.97" + "\n")
            f.write("Tag-File-Character-Encoding: UTF-8" + "\n")

        # Write dataset metadata if found
        metadata = await MetadataDB.find(
            MetadataDB.resource.resource_id == ObjectId(dataset_id)
        ).to_list()
        if len(metadata) > 0:
            datasetmetadata_path = os.path.join(
                current_temp_dir, "_dataset_metadata.json"
            )
            metadata_content = json_util.dumps(metadata)
            with open(datasetmetadata_path, "w") as f:
                f.write(metadata_content)
            crate.add_file(
                datasetmetadata_path,
                dest_path="metadata/_dataset_metadata.json",
                properties={"name": "_dataset_metadata.json"},
            )

        bag_size = 0  # bytes
        file_count = 0

        async for file in FileDB.find(FileDB.dataset_id == ObjectId(dataset_id)):
            file_count += 1
            file_name = file.name
            if file.folder_id is not None:
                hierarchy = await _get_folder_hierarchy(file.folder_id, "")
                dest_folder = os.path.join(current_temp_dir, hierarchy.lstrip("/"))
                if not os.path.isdir(dest_folder):
                    os.mkdir(dest_folder)
                file_name = hierarchy + file_name
            current_file_path = os.path.join(current_temp_dir, file_name.lstrip("/"))

            content = fs.get_object(settings.MINIO_BUCKET_NAME, str(file.id))
            file_md5_hash = hashlib.md5(content.data).hexdigest()
            with open(current_file_path, "wb") as f1:
                f1.write(content.data)
            with open(manifest_path, "a") as mpf:
                mpf.write(file_md5_hash + " " + file_name + "\n")
            crate.add_file(
                current_file_path,
                dest_path="data/" + file_name,
                properties={"name": file_name},
            )
            content.close()
            content.release_conn()

            current_file_size = os.path.getsize(current_file_path)
            bag_size += current_file_size

            metadata = await MetadataDB.find(
                MetadataDB.resource.resource_id == ObjectId(dataset_id)
            ).to_list()
            if len(metadata) > 0:
                metadata_filename = file_name + "_metadata.json"
                metadata_filename_temp_path = os.path.join(
                    current_temp_dir, metadata_filename
                )
                metadata_content = json_util.dumps(metadata)
                with open(metadata_filename_temp_path, "w") as f:
                    f.write(metadata_content)
                crate.add_file(
                    metadata_filename_temp_path,
                    dest_path="metadata/" + metadata_filename,
                    properties={"name": metadata_filename},
                )

        bag_size_kb = bag_size / 1024

        with open(bagit_path, "a") as f:
            f.write("Bag-Size: " + str(bag_size_kb) + " kB" + "\n")
            f.write("Payload-Oxum: " + str(bag_size) + "." + str(file_count) + "\n")
            f.write("Internal-Sender-Identifier: " + dataset_id + "\n")
            f.write("Internal-Sender-Description: " + dataset.description + "\n")
            f.write("Contact-Name: " + user_full_name + "\n")
            f.write("Contact-Email: " + user.email + "\n")
        crate.add_file(
            bagit_path, dest_path="bagit.txt", properties={"name": "bagit.txt"}
        )
        crate.add_file(
            manifest_path,
            dest_path="manifest-md5.txt",
            properties={"name": "manifest-md5.txt"},
        )
        crate.add_file(
            bag_info_path, dest_path="bag-info.txt", properties={"name": "bag-info.txt"}
        )

        # Generate tag manifest file
        manifest_md5_hash = hashlib.md5(open(manifest_path, "rb").read()).hexdigest()
        bagit_md5_hash = hashlib.md5(open(bagit_path, "rb").read()).hexdigest()
        bag_info_md5_hash = hashlib.md5(open(bag_info_path, "rb").read()).hexdigest()

        with open(tagmanifest_path, "w") as f:
            f.write(bagit_md5_hash + " " + "bagit.txt" + "\n")
            f.write(manifest_md5_hash + " " + "manifest-md5.txt" + "\n")
            f.write(bag_info_md5_hash + " " + "bag-info.txt" + "\n")
        crate.add_file(
            tagmanifest_path,
            dest_path="tagmanifest-md5.txt",
            properties={"name": "tagmanifest-md5.txt"},
        )

        zip_name = dataset.name + ".zip"
        path_to_zip = os.path.join(current_temp_dir, zip_name)
        crate.write_zip(path_to_zip)
        f = open(path_to_zip, "rb", buffering=0)
        zip_bytes = f.read()
        stream = io.BytesIO(zip_bytes)
        f.close()
        try:
            shutil.rmtree(current_temp_dir)
        except Exception as e:
            print("could not delete file")
            print(e)

        # TODO: Increment dataset download count, update index

        return Response(
            stream.getvalue(),
            media_type="application/x-zip-compressed",
            headers={"Content-Disposition": f'attachment;filename="{zip_name}"'},
        )
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


# submits file to extractor
# can handle parameeters pass in as key/values in info
@router.post("/{dataset_id}/extract")
async def get_dataset_extract(
    dataset_id: str,
    extractorName: str,
    request: Request,
    # parameters don't have a fixed model shape
    parameters: dict = None,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    allow: bool = Depends(Authorization("uploader")),
):
    if extractorName is None:
        raise HTTPException(status_code=400, detail=f"No extractorName specified")
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        access_token = credentials.credentials
        queue = extractorName
        routing_key = queue
        return await submit_dataset_job(
            DatasetOut(**dataset.dict()),
            routing_key,
            parameters,
            user,
            access_token,
            rabbitmq_client,
        )
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
