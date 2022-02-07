import os
import io
import datetime
from typing import List, Optional
import json
from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException, Depends, File, UploadFile
from pymongo import MongoClient
from pydantic import Json
from minio import Minio
from fastapi.encoders import jsonable_encoder

from app import dependencies
from app.models.datasets import Dataset
from app.models.files import ClowderFile, FileVersion
from app.auth import AuthHandler
from app.config import settings


router = APIRouter()

auth_handler = AuthHandler()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


@router.post("", response_model=Dataset)
async def save_dataset(
    dataset_info: Json[Dataset],
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
):
    ds = dict(dataset_info) if dataset_info is not None else {}
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    ds["author"] = user["_id"]
    new_dataset = await db["datasets"].insert_one(ds)
    found = await db["datasets"].find_one({"_id": new_dataset.inserted_id})
    return Dataset.from_mongo(found)


@router.get("", response_model=List[Dataset])
async def get_datasets(
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 2,
    mine=False,
):
    datasets = []
    if mine:
        for doc in (
            await db["datasets"]
            .find({"author": ObjectId(user_id)})
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            datasets.append(doc)
    else:
        for doc in (
            await db["datasets"].find().skip(skip).limit(limit).to_list(length=limit)
        ):
            datasets.append(doc)
    return datasets


@router.get("/{dataset_id}")
async def get_dataset(dataset_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        return Dataset.from_mongo(dataset)
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/files")
async def get_dataset_files(
    dataset_id: str, db: MongoClient = Depends(dependencies.get_db)
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        file_ids = dataset["files"]
        files = []
        for file_id in file_ids:
            if (
                file := await db["files"].find_one({"_id": ObjectId(file_id)})
            ) is not None:
                files.append(ClowderFile.from_mongo(file))
        return files
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.put("/{dataset_id}", response_model=Dataset)
async def edit_dataset(
    dataset_id: str,
    dataset_info: Dataset,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        ds = dict(dataset_info) if dataset_info is not None else {}
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        ds["author"] = user["_id"]
        ds["modified"] = datetime.datetime.utcnow()
        try:
            dataset.update(ds)
            dataset["_id"] = dataset_id
            dataset["modified"] = datetime.datetime.utcnow()
            db["datasets"].replace_one({"_id": ObjectId(dataset_id)}, dataset)
        except Exception as e:
            print(e)
        return Dataset.from_mongo(dataset)
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        dataset_files = dataset["files"]
        for f in dataset_files:
            fs.remove_object(clowder_bucket, str(f))
        res = await db["datasets"].delete_one({"_id": ObjectId(dataset_id)})
        return {"deleted": dataset_id}
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/files", response_model=ClowderFile)
async def save_file(
    dataset_id: str,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
    file_info: Optional[ClowderFile] = None,
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        # Prepare new file entry
        f = dict(file_info) if file_info is not None else {}
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        f["name"] = file.filename
        f["creator"] = user["_id"]
        # Add to db and update dataset
        new_file = await db["files"].insert_one(f)
        found = await db["files"].find_one({"_id": new_file.inserted_id})
        new_file_id = found["_id"]
        updated_dataset = await db["datasets"].update_one(
            {"_id": ObjectId(dataset_id)}, {"$push": {"files": ObjectId(new_file_id)}}
        )

        # Use unique ID as key for file storage
        while content := file.file.read(
            settings.MINIO_UPLOAD_CHUNK_SIZE
        ):  # async read chunk
            fs.put_object(
                settings.MINIO_BUCKET_NAME,
                str(new_file_id),
                io.BytesIO(content),
                length=-1,
                part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
            )  # async write chunk to minio

        return ClowderFile.from_mongo(found)
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
