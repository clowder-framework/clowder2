import datetime
import io
import os
import zipfile
import tempfile
from typing import List, Optional, BinaryIO
from collections.abc import Mapping, Iterable
from bson import ObjectId
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    File,
    UploadFile,
    Response,
    Request,
)
from fastapi import Form
from minio import Minio
from pymongo import MongoClient
import pika
from pika.adapters.blocking_connection import BlockingChannel
import json

from app import keycloak_auth
from app import dependencies
from app.keycloak_auth import get_user, get_current_user
from app.config import settings
from app.models.datasets import (
    DatasetBase,
    DatasetIn,
    DatasetDB,
    DatasetOut,
    DatasetPatch,
)
from app.models.files import FileIn, FileOut, FileVersion, FileDB
from app.models.folders import FolderOut, FolderIn, FolderDB
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut
from app.models.extractors import ExtractorIn
from app.models.metadata import (
    MongoDBRef,
    MetadataAgent,
    MetadataIn,
    MetadataDB,
    MetadataOut,
    MetadataPatch,
    validate_context,
    patch_metadata,
)
from app.routers.files import add_file_entry, remove_file_entry

router = APIRouter()

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
    db: MongoClient,
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
        folder_db = FolderDB(**folder_dict, author=user)
        new_folder = await db["folders"].insert_one(folder_db.to_mongo())
        new_folder_id = new_folder.inserted_id

        # Store ID and call recursively on child folders
        new_folder_path = folder_path + os.path.sep + k
        folder_lookup[new_folder_path] = new_folder_id
        if isinstance(v, Mapping):
            folder_lookup = await _create_folder_structure(
                dataset_id, v, new_folder_path, folder_lookup, user, db, new_folder_id
            )

    return folder_lookup


async def _get_folder_hierarchy(
    folder_id: str,
    hierarchy: str,
    db: MongoClient,
):
    """Generate a string of nested path to folder for use in zip file creation."""
    found = await db["folders"].find_one({"_id": ObjectId(folder_id)})
    folder = FolderOut.from_mongo(found)
    hierarchy = folder.name + "/" + hierarchy
    if folder.parent_folder is not None:
        hierarchy = await _get_folder_hierarchy(folder.parent_folder, hierarchy, db)
    return hierarchy


@router.post("", response_model=DatasetOut)
async def save_dataset(
    dataset_in: DatasetIn,
    user=Depends(keycloak_auth.get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    result = dataset_in.dict()
    dataset_db = DatasetDB(**dataset_in.dict(), author=user)
    new_dataset = await db["datasets"].insert_one(dataset_db.to_mongo())
    found = await db["datasets"].find_one({"_id": new_dataset.inserted_id})
    dataset_out = DatasetOut.from_mongo(found)
    return dataset_out


@router.get("", response_model=List[DatasetOut])
async def get_datasets(
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 2,
    mine: bool = False,
):
    datasets = []
    if mine:
        for doc in (
            await db["datasets"]
            .find({"author.email": user_id})
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            datasets.append(DatasetOut.from_mongo(doc))
    else:
        for doc in (
            await db["datasets"].find().skip(skip).limit(limit).to_list(length=limit)
        ):
            datasets.append(DatasetOut.from_mongo(doc))
    return datasets


@router.get("/{dataset_id}", response_model=DatasetOut)
async def get_dataset(dataset_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        return DatasetOut.from_mongo(dataset)
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/files")
async def get_dataset_files(
    dataset_id: str,
    folder_id: Optional[str] = None,
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 2,
):
    files = []
    if folder_id is not None:
        for f in (
            await db["files"]
            .find(
                {
                    "dataset_id": ObjectId(dataset_id),
                    "folder_id": ObjectId(folder_id),
                }
            )
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            files.append(FileOut.from_mongo(f))
    else:
        for f in (
            await db["files"]
            .find(
                {
                    "dataset_id": ObjectId(dataset_id),
                    "folder_id": None,
                }
            )
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            files.append(FileOut.from_mongo(f))
    return files


@router.put("/{dataset_id}", response_model=DatasetOut)
async def edit_dataset(
    dataset_id: str,
    dataset_info: DatasetBase,
    db: MongoClient = Depends(dependencies.get_db),
    user_id=Depends(get_user),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        ds = dict(dataset_info) if dataset_info is not None else {}
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        ds["author"] = UserOut(**user)
        ds["modified"] = datetime.datetime.utcnow()
        try:
            dataset.update(ds)
            await db["datasets"].replace_one(
                {"_id": ObjectId(dataset_id)}, DatasetDB(**dataset).to_mongo()
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return DatasetOut.from_mongo(dataset)
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.patch("/{dataset_id}", response_model=DatasetOut)
async def patch_dataset(
    dataset_id: str,
    dataset_info: DatasetPatch,
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        ds = dict(dataset_info) if dataset_info is not None else {}
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        ds["author"] = UserOut(**user)
        ds["modified"] = datetime.datetime.utcnow()
        try:
            dataset.update((k, v) for k, v in ds.items() if v is not None)
            await db["datasets"].replace_one(
                {"_id": ObjectId(dataset_id)}, DatasetDB(**dataset).to_mongo()
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return DatasetOut.from_mongo(dataset)


@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (await db["datasets"].find_one({"_id": ObjectId(dataset_id)})) is not None:
        # delete dataset first to minimize files/folder being uploaded to a delete dataset

        await db["datasets"].delete_one({"_id": ObjectId(dataset_id)})
        await db.metadata.delete_many({"resource.resource_id": ObjectId(dataset_id)})
        async for file in db["files"].find({"dataset_id": ObjectId(dataset_id)}):
            remove_file_entry(file.id, db, fs)
        await db["folders"].delete_many({"dataset_id": ObjectId(dataset_id)})
        return {"deleted": dataset_id}
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/folders", response_model=FolderOut)
async def add_folder(
    dataset_id: str,
    folder_in: FolderIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    folder_dict = folder_in.dict()
    folder_db = FolderDB(
        **folder_in.dict(), author=user, dataset_id=PyObjectId(dataset_id)
    )
    parent_folder = folder_in.parent_folder
    if parent_folder is not None:
        folder = await db["folders"].find_one({"_id": ObjectId(parent_folder)})
        if folder is None:
            raise HTTPException(
                status_code=400, detail=f"Parent folder {parent_folder} not found"
            )
    new_folder = await db["folders"].insert_one(folder_db.to_mongo())
    found = await db["folders"].find_one({"_id": new_folder.inserted_id})
    folder_out = FolderOut.from_mongo(found)
    return folder_out


@router.get("/{dataset_id}/folders")
async def get_dataset_folders(
    dataset_id: str,
    parent_folder: Optional[str] = None,
    db: MongoClient = Depends(dependencies.get_db),
):
    folders = []
    if parent_folder is None:
        async for f in db["folders"].find(
            {"dataset_id": ObjectId(dataset_id), "parent_folder": None}
        ):
            folders.append(FolderDB.from_mongo(f))
    else:
        async for f in db["folders"].find(
            {
                "dataset_id": ObjectId(dataset_id),
                "parent_folder": ObjectId(parent_folder),
            }
        ):
            folders.append(FolderDB.from_mongo(f))
    return folders


@router.post("/{dataset_id}/files", response_model=FileOut)
async def save_file(
    dataset_id: str,
    folder_id: Optional[str] = Form(None),
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        if user is None:
            raise HTTPException(
                status_code=401, detail=f"User not found. Session might have expired."
            )

        fileDB = FileDB(name=file.filename, creator=user, dataset_id=dataset["_id"])

        if folder_id is not None:
            if (
                folder := await db["folders"].find_one({"_id": ObjectId(folder_id)})
            ) is not None:
                folder = FolderOut.from_mongo(folder)
                fileDB.folder_id = folder.id
            else:
                raise HTTPException(
                    status_code=404, detail=f"Folder {folder_id} not found"
                )

        await add_file_entry(
            fileDB, user, db, fs, file.file, content_type=file.content_type
        )

        return fileDB
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/createFromZip", response_model=DatasetOut)
async def create_dataset_from_zip(
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
):
    if user is None:
        raise HTTPException(
            status_code=401, detail=f"User not found. Session might have expired."
        )

    if file.filename.endswith(".zip") == False:
        raise HTTPException(status_code=404, detail=f"File is not a zip file")

    # Read contents of zip file into temporary location
    with tempfile.TemporaryFile() as tmp_zip:
        tmp_zip.write(file.file.read())

        with zipfile.ZipFile(tmp_zip, "r") as zip_file:
            zip_contents = zip_file.namelist()
            zip_directory = _describe_zip_contents(zip_contents)

        # Create dataset
        dataset_name = file.filename.rstrip(".zip")
        dataset_description = "Uploaded as %s" % file.filename
        ds_dict = {"name": dataset_name, "description": dataset_description}
        dataset_db = DatasetDB(**ds_dict, author=user)
        new_dataset = await db["datasets"].insert_one(dataset_db.to_mongo())
        dataset_id = new_dataset.inserted_id

        # Create folders
        folder_lookup = await _create_folder_structure(
            dataset_id, zip_directory, "", {}, user, db
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
                        fileDB = FileDB(
                            name=filename,
                            creator=user,
                            dataset_id=dataset_id,
                            folder_id=folder_id,
                        )
                    else:
                        fileDB = FileDB(
                            name=filename, creator=user, dataset_id=dataset_id
                        )
                    with open(extracted, "rb") as file_reader:
                        await add_file_entry(fileDB, user, db, fs, file_reader)
                    if os.path.isfile(extracted):
                        os.remove(extracted)

    found = await db["datasets"].find_one({"_id": new_dataset.inserted_id})
    dataset_out = DatasetOut.from_mongo(found)
    return dataset_out


@router.get("/{dataset_id}/download", response_model=DatasetOut)
async def download_dataset(
    dataset_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        dataset = DatasetOut.from_mongo(dataset)
        stream = io.BytesIO()
        z = zipfile.ZipFile(stream, "w")
        async for f in db["files"].find({"dataset_id": dataset.id}):
            file = FileOut.from_mongo(f)
            file_name = file.name
            if file.folder_id is not None:
                hierarchy = await _get_folder_hierarchy(file.folder_id, "", db)
                file_name = "/" + hierarchy + file_name
            content = fs.get_object(settings.MINIO_BUCKET_NAME, str(file.id))
            z.writestr(file_name, content.data)
            content.close()
            content.release_conn()
        z.close()
        return Response(
            stream.getvalue(),
            media_type="application/x-zip-compressed",
            headers={
                "Content-Disposition": f'attachment;filename="{dataset.name}.zip"'
            },
        )
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/extract")
async def get_dataset_extract(
    dataset_id: str,
    info: Request,
    db: MongoClient = Depends(dependencies.get_db),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        req_info = await info.json()
        if "extractor" in req_info:
            req_headers = info.headers
            raw = req_headers.raw
            authorization = raw[1]
            token = authorization[1].decode("utf-8")
            token = token.lstrip("Bearer")
            token = token.lstrip(" ")
            # TODO check of extractor exists
            msg = {"message": "testing", "dataseet_id": dataset_id}
            body = {}
            body["secretKey"] = token
            body["token"] = token
            body["host"] = "http://127.0.0.1:8000"
            body["retry_count"] = 0
            body["filename"] = dataset["name"]
            body["id"] = dataset_id
            body["datasetId"] = dataset_id
            body["resource_type"] = "dataset"
            body["flags"] = ""
            current_queue = req_info["extractor"]
            if "parameters" in req_info:
                current_parameters = req_info["parameters"]
            current_routing_key = "extractors." + current_queue
            rabbitmq_client.queue_bind(
                exchange="extractors",
                queue=current_queue,
                routing_key=current_routing_key,
            )
            rabbitmq_client.basic_publish(
                exchange="extractors",
                routing_key=current_routing_key,
                body=json.dumps(body, ensure_ascii=False),
                properties=pika.BasicProperties(
                    content_type="application/json", delivery_mode=1
                ),
            )
            return msg
        else:
            raise HTTPException(status_code=404, detail=f"No extractor submitted")
    else:
        raise HTTPException(status_code=404, detail=f"File {dataset_id} not found")
