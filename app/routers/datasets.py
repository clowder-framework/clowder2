import datetime
import io
import os
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from fastapi import Form
from minio import Minio
from pymongo import MongoClient

from app import dependencies
from app.auth import AuthHandler
from app.config import settings
from app.models.datasets import DatasetBase, DatasetIn, DatasetDB, DatasetOut, DatasetPatch
from app.models.files import FileIn, FileOut, FileVersion, FileDB
from app.models.folders import FolderOut, FolderIn, FolderDB
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut

router = APIRouter()

auth_handler = AuthHandler()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


@router.post("", response_model=DatasetOut)
async def save_dataset(
    dataset_in: DatasetIn,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    dataset_db = DatasetDB(**dataset_in.dict(), author=UserOut(**user))
    new_dataset = await db["datasets"].insert_one(dataset_db.to_mongo())
    found = await db["datasets"].find_one({"_id": new_dataset.inserted_id})
    dataset_out = DatasetOut.from_mongo(found)
    return dataset_out


@router.get("", response_model=List[DatasetOut])
async def get_datasets(
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 2,
    mine: bool = False,
):
    datasets = []
    if mine:
        for doc in (
            await db["datasets"]
            .find({"author.id": ObjectId(user_id)})
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
):
    files = []
    if folder_id is None:
        async for f in db["files"].find(
            {"dataset_id": ObjectId(dataset_id), "folder_id": None}
        ):
            files.append(FileOut.from_mongo(f))
    else:
        async for f in db["files"].find(
            {
                "dataset_id": ObjectId(dataset_id),
                "folder_id": ObjectId(folder_id),
            }
        ):
            files.append(FileOut.from_mongo(f))
    return files


@router.put("/{dataset_id}", response_model=DatasetOut)
async def edit_dataset(
    dataset_id: str,
    dataset_info: DatasetBase,
    user_id=Depends(auth_handler.auth_wrapper),
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
            dataset.update(ds)
            await db["datasets"].replace_one({"_id": ObjectId(dataset_id)}, DatasetDB(**dataset).to_mongo())
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return DatasetOut.from_mongo(dataset)
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.patch("/{dataset_id}", response_model=DatasetOut)
async def patch_dataset(
    dataset_id: str,
    dataset_info: DatasetPatch,
    user_id=Depends(auth_handler.auth_wrapper),
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
            await db["datasets"].replace_one({"_id": ObjectId(dataset_id)}, DatasetDB(**dataset).to_mongo())
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
        async for file in db["files"].find({"dataset_id": ObjectId(dataset_id)}):
            fs.remove_object(clowder_bucket, str(file))
        files_deleted = await db.files.delete_many({"dataset_id": ObjectId(dataset_id)})
        folders_delete = await db["folders"].delete_many(
            {"dataset_id": ObjectId(dataset_id)}
        )
        return {"deleted": dataset_id}
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/folders", response_model=FolderOut)
async def add_folder(
    dataset_id: str,
    folder_in: FolderIn,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    folder_db = FolderDB(
        **folder_in.dict(), author=UserOut(**user), dataset_id=PyObjectId(dataset_id)
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


@router.delete("/{dataset_id}/folder/{folder_id}")
async def delete_folder(
    dataset_id: str,
    folder_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (await db["folder"].find_one({"_id": ObjectId(dataset_id)})) is not None:
        async for f in db["files"].find({"dataset_id": ObjectId(dataset_id)}):
            fs.remove_object(clowder_bucket, str(f))
        await db["datasets"].delete_one({"_id": ObjectId(dataset_id)})
        return {"deleted": dataset_id}
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/files", response_model=FileOut)
async def save_file(
    dataset_id: str,
    folder_id: Optional[str] = Form(None),
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
    file_info: Optional[FileIn] = None,
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        userOut = UserOut(**user)
        if user is None:
            raise HTTPException(
                status_code=401, detail=f"User not found. Session might have expired."
            )
        dataset = await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
        if dataset is None:
            raise HTTPException(
                status_code=404, detail=f"Dataset {dataset_id} not found"
            )
        fileDB = FileDB(name=file.filename, creator=userOut, dataset_id=dataset["_id"])
        if folder_id is not None:
            fileDB.folder_id = ObjectId(folder_id)

        # Add to db and update dataset
        new_file = await db["files"].insert_one(fileDB.to_mongo())
        new_file_id = new_file.inserted_id

        # Use unique ID as key for Minio and get initial version ID
        version_id = None
        while content := file.file.read(
            settings.MINIO_UPLOAD_CHUNK_SIZE
        ):  # async read chunk
            response = fs.put_object(
                settings.MINIO_BUCKET_NAME,
                str(new_file_id),
                io.BytesIO(content),
                length=-1,
                part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
            )  # async write chunk to minio
            version_id = response.version_id
        fileDB.version = version_id
        await db["files"].replace_one({"_id": ObjectId(new_file_id)}, fileDB.to_mongo())

        # Add FileVersion entry and update file
        new_version = FileVersion(
            version_id=version_id,
            file_id=new_file_id,
            creator=userOut,
        )
        await db["file_versions"].insert_one(new_version.to_mongo())
        return fileDB
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
