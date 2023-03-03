import datetime
import hashlib
import io
import os
import shutil
import tempfile
import zipfile
from collections.abc import Mapping, Iterable
from typing import List, Optional, Union

import pymongo
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
from pymongo import MongoClient
from rocrate.model.person import Person
from rocrate.rocrate import ROCrate

from app import dependencies
from app import keycloak_auth
from app.deps.authorization_deps import Authorization
from app.config import settings
from app.keycloak_auth import get_token
from app.keycloak_auth import get_user, get_current_user
from app.models.datasets import (
    DatasetBase,
    DatasetIn,
    DatasetDB,
    DatasetOut,
    DatasetPatch,
)
from app.models.files import FileOut, FileDB
from app.models.folders import FolderOut, FolderIn, FolderDB
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut
from app.rabbitmq.listeners import submit_dataset_job
from app.routers.files import add_file_entry, remove_file_entry
from app.search.connect import (
    connect_elasticsearch,
    insert_record,
    delete_document_by_id,
    delete_document_by_query,
    update_record,
)
from app.models.authorization import AuthorizationDB, RoleType

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


async def remove_folder_entry(
    folder_id: Union[str, ObjectId],
    db: MongoClient,
):
    """Remove FolderDB object into MongoDB"""
    await db["folders"].delete_one({"_id": ObjectId(folder_id)})


@router.post("", response_model=DatasetOut)
async def save_dataset(
    dataset_in: DatasetIn,
    user=Depends(keycloak_auth.get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    # Check all connection and abort if any one of them is not available
    if db is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    dataset_db = DatasetDB(**dataset_in.dict(), author=user)
    new_dataset = await db["datasets"].insert_one(dataset_db.to_mongo())
    found = await db["datasets"].find_one({"_id": new_dataset.inserted_id})
    dataset_out = DatasetOut.from_mongo(found)

    # Create authorization entry
    await db["authorization"].insert_one(
        AuthorizationDB(
            dataset_id=new_dataset.inserted_id,
            user_id=user.email,
            role=RoleType.OWNER,
            creator=user.email,
        ).to_mongo()
    )

    # Add en entry to the dataset index
    doc = {
        "name": dataset_out.name,
        "description": dataset_out.description,
        "author": dataset_out.author.email,
        "created": dataset_out.created,
        "modified": dataset_out.modified,
        "download": dataset_out.downloads,
    }
    insert_record(es, "dataset", doc, dataset_out.id)

    return dataset_out


@router.get("", response_model=List[DatasetOut])
async def get_datasets(
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 10,
    mine: bool = False,
):
    datasets = []
    if mine:
        for doc in (
            await db["datasets_view"]
            .find(
                {
                    "$and": [
                        {"author.email": user_id},
                        {"auth": {"$elemMatch": {"user_id": {"$eq": user_id}}}},
                    ]
                }
            )
            .sort([("created", pymongo.DESCENDING)])
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            datasets.append(DatasetOut.from_mongo(doc))
    else:
        for doc in (
            await db["datasets_view"]
            .find(
                {
                    "$or": [
                        {"author.email": user_id},
                        {"auth": {"$elemMatch": {"user_id": {"$eq": user_id}}}},
                    ]
                }
            )
            .sort([("created", pymongo.DESCENDING)])
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            datasets.append(DatasetOut.from_mongo(doc))
    return datasets


@router.get("/{dataset_id}", response_model=DatasetOut)
async def get_dataset(
    dataset_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(Authorization("viewer")),
):
    try:
      if (
          dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
      ) is not None:
        return DatasetOut.from_mongo(dataset)
    except:
      raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/files")
async def get_dataset_files(
    dataset_id: str,
    folder_id: Optional[str] = None,
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 10,
):
    files = []
    if folder_id is not None:
        for f in (
            await db["files_view"]
            .find(
                {
                    "$and": [
                        {
                            "dataset_id": ObjectId(dataset_id),
                            "folder_id": ObjectId(folder_id),
                        },
                        {
                            "$or": [
                                {"creator.email": user_id},
                                {"auth": {"$elemMatch": {"user_id": {"$eq": user_id}}}},
                            ]
                        },
                    ]
                }
            )
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            files.append(FileOut.from_mongo(f))
    else:
        for f in (
            await db["files_view"]
            .find(
                {
                    "$and": [
                        {
                            "dataset_id": ObjectId(dataset_id),
                            "folder_id": None,
                        },
                        {
                            "$or": [
                                {"creator.email": user_id},
                                {"auth": {"$elemMatch": {"user_id": {"$eq": user_id}}}},
                            ]
                        },
                    ]
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
    es=Depends(dependencies.get_elasticsearchclient),
):
    # Check all connection and abort if any one of them is not available
    if db is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        ds = dict(dataset_info) if dataset_info is not None else {}
        user = await db["users"].find_one({"email": user_id})
        ds["author"] = UserOut(**user)
        ds["modified"] = datetime.datetime.utcnow()
        try:
            dataset.update(ds)
            await db["datasets"].replace_one(
                {"_id": ObjectId(dataset_id)}, DatasetDB(**dataset).to_mongo()
            )
            # Update entry to the dataset index
            doc = {
                "doc": {
                    "name": dataset["name"],
                    "description": dataset["description"],
                    "author": UserOut(**user).email,
                    "modified": dataset["modified"],
                }
            }
            update_record(es, "dataset", doc, dataset_id)
            # updating metadata in elasticsearch
            if (
                metadata := await db["metadata"].find_one(
                    {"resource.resource_id": ObjectId(dataset_id)}
                )
            ) is not None:
                doc = {
                    "doc": {
                        "name": dataset["name"],
                        "description": dataset["description"],
                        "author": UserOut(**user).email,
                    }
                }
                update_record(es, "metadata", doc, str(metadata["_id"]))
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
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    # Check all connection and abort if any one of them is not available
    if db is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        ds = dict(dataset_info) if dataset_info is not None else {}
        user = await db["users"].find_one({"email": user_id})
        ds["author"] = UserOut(**user)
        ds["modified"] = datetime.datetime.utcnow()
        try:
            dataset.update((k, v) for k, v in ds.items() if v is not None)
            await db["datasets"].replace_one(
                {"_id": ObjectId(dataset_id)}, DatasetDB(**dataset).to_mongo()
            )
            # Update entry to the dataset index
            doc = {
                "doc": {
                    "name": dataset["name"],
                    "description": dataset["description"],
                    "author": UserOut(**user).email,
                    "modified": dataset["modified"],
                }
            }
            update_record(es, "dataset", doc, dataset_id)
            # updating metadata in elasticsearch
            if (
                metadata := await db["metadata"].find_one(
                    {"resource.resource_id": ObjectId(dataset_id)}
                )
            ) is not None:
                doc = {
                    "doc": {
                        "name": dataset["name"],
                        "description": dataset["description"],
                        "author": UserOut(**user).email,
                    }
                }
                update_record(es, "metadata", doc, str(metadata["_id"]))
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return DatasetOut.from_mongo(dataset)


@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    # Check all connection and abort if any one of them is not available
    if db is None or fs is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    if (await db["datasets"].find_one({"_id": ObjectId(dataset_id)})) is not None:
        # delete from elasticsearch
        delete_document_by_id(es, "dataset", dataset_id)
        query = {"match": {"resource_id": dataset_id}}
        delete_document_by_query(es, "metadata", query)
        # delete dataset first to minimize files/folder being uploaded to a delete dataset

        await db["datasets"].delete_one({"_id": ObjectId(dataset_id)})
        await db.metadata.delete_many({"resource.resource_id": ObjectId(dataset_id)})
        async for file in db["files"].find({"dataset_id": ObjectId(dataset_id)}):
            file = FileOut(**file)
            await remove_file_entry(file.id, db, fs, es)
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
    user_id=Depends(get_user),
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
                "$and": [
                    {
                        "dataset_id": ObjectId(dataset_id),
                        "parent_folder": ObjectId(parent_folder),
                    },
                    {
                        "$or": [
                            {"author.email": user_id},
                            {"auth": {"$elemMatch": {"user_id": {"$eq": user_id}}}},
                        ]
                    },
                ]
            }
        ):
            folders.append(FolderDB.from_mongo(f))
    return folders


@router.delete("/{dataset_id}/folders/{folder_id}")
async def delete_folder(
    dataset_id: str,
    folder_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    if (await db["folders"].find_one({"_id": ObjectId(folder_id)})) is not None:
        # delete current folder and files
        await remove_folder_entry(folder_id, db)
        async for file in db["files"].find({"folder_id": ObjectId(folder_id)}):
            file = FileOut(**file)
            await remove_file_entry(file.id, db, fs, es)

        # list all child folders and delete child folders/files
        parent_folder_id = folder_id

        async def _delete_nested_folders(parent_folder_id):
            while (
                folders := await db["folders"].find_one(
                    {
                        "dataset_id": ObjectId(dataset_id),
                        "parent_folder": ObjectId(parent_folder_id),
                    }
                )
            ) is not None:
                async for folder in db["folders"].find(
                    {
                        "dataset_id": ObjectId(dataset_id),
                        "parent_folder": ObjectId(parent_folder_id),
                    }
                ):
                    folder = FolderOut(**folder)
                    parent_folder_id = folder.id

                    # recursively delete child folder and files
                    await _delete_nested_folders(parent_folder_id)

                    await remove_folder_entry(folder.id, db)
                    async for file in db["files"].find(
                        {"folder_id": ObjectId(folder.id)}
                    ):
                        file = FileOut(**file)
                        await remove_file_entry(file.id, db, fs, es)

        await _delete_nested_folders(parent_folder_id)

        return {"deleted": folder_id}
    else:
        raise HTTPException(status_code=404, detail=f"Folder {folder_id} not found")


@router.post("/{dataset_id}/files", response_model=FileOut)
async def save_file(
    dataset_id: str,
    folder_id: Optional[str] = None,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
    es=Depends(dependencies.get_elasticsearchclient),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    credentials: HTTPAuthorizationCredentials = Security(security),
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

        access_token = credentials.credentials
        await add_file_entry(
            fileDB,
            user,
            db,
            fs,
            es,
            rabbitmq_client,
            access_token,
            file.file,
            content_type=file.content_type,
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
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    token: str = Depends(get_token),
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
                        await add_file_entry(
                            fileDB,
                            user,
                            db,
                            fs,
                            es,
                            rabbitmq_client,
                            token,
                            file_reader,
                        )
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
        dataset = DatasetOut(**dataset)
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
        metadata = []
        async for md in db["metadata"].find(
            {"resource.resource_id": ObjectId(dataset_id)}
        ):
            metadata.append(md)
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

        async for f in db["files"].find({"dataset_id": ObjectId(dataset_id)}):
            file_count += 1
            file = FileOut.from_mongo(f)
            file_name = file.name
            if file.folder_id is not None:
                hierarchy = await _get_folder_hierarchy(file.folder_id, "", db)
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

            metadata = []
            async for md in db["metadata"].find(
                {"resource.resource_id": ObjectId(file.id)}
            ):
                metadata.append(md)
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
        return Response(
            stream.getvalue(),
            media_type="application/x-zip-compressed",
            headers={"Content-Disposition": f'attachment;filename="{zip_name}"'},
        )
    else:
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
    db: MongoClient = Depends(dependencies.get_db),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        dataset_out = DatasetOut.from_mongo(dataset)
        access_token = credentials.credentials
        req_headers = request.headers
        raw = req_headers.raw
        authorization = raw[1]
        token = authorization[1].decode("utf-8")
        token = token.lstrip("Bearer")
        token = token.lstrip(" ")
        # TODO check of extractor exists
        msg = {"message": "testing", "dataset_id": dataset_id}
        body = {}
        body["secretKey"] = access_token
        body["token"] = access_token
        body["host"] = settings.API_HOST
        body["retry_count"] = 0
        body["filename"] = dataset["name"]
        body["id"] = dataset_id
        body["datasetId"] = dataset_id
        body["resource_type"] = "dataset"
        body["flags"] = ""
        current_queue = extractorName
        if parameters is not None:
            body["parameters"] = parameters
        else:
            parameters = {}
        current_routing_key = current_queue

        job_id = await submit_dataset_job(
            dataset_out,
            current_queue,
            current_routing_key,
            parameters,
            user,
            access_token,
            db,
            rabbitmq_client,
        )

        return job_id
    else:
        raise HTTPException(status_code=404, detail=f"File {dataset_id} not found")
