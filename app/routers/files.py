import os
import io
from typing import List, Optional

from bson import ObjectId
from fastapi import (
    APIRouter,
    Request,
    HTTPException,
    Depends,
    Form,
    File,
    UploadFile,
)
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import Json
from pymongo import MongoClient
from minio import Minio

from app import dependencies
from app.models.files import ClowderFile
from app.auth import AuthHandler
from app.config import settings

router = APIRouter()

auth_handler = AuthHandler()


@router.post("/{dataset_id}")
async def save_file(
    dataset_id: str,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
    file_info: Optional[Json[ClowderFile]] = None,
):
    # First, add to database and get unique ID
    f = dict(file_info) if file_info is not None else {}
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    dataset = await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    f["name"] = file.filename
    f["creator"] = user["_id"]
    new_file = await db["files"].insert_one(f)
    found = await db["files"].find_one({"_id": new_file.inserted_id})
    new_file_id = found["_id"]

    # TODO: If file with same filename exists in dataset, default to overwriting (?)
    updated_dataset = await db["datasets"].update_one(
        {"_id": ObjectId(dataset_id)}, {"$push": {"files": ObjectId(new_file_id)}}
    )

    # Second, use unique ID as key for file storage
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


@router.put("/{file_id}")
async def update_file(
    file_id: str,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
    file_info: Optional[Json[ClowderFile]] = None,
):
    # First, add to database and get unique ID
    f = dict(file_info) if file_info is not None else {}
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    # TODO: Harden this piece for when data is missing
    existing = await db["files"].find_one({"_id": ObjectId(file_id)})
    existing_file = ClowderFile.from_mongo(existing)

    # Update file in Minio and get the new version IDs
    while content := file.file.read(
        settings.MINIO_UPLOAD_CHUNK_SIZE
    ):  # async read chunk
        fs.put_object(
            settings.MINIO_BUCKET_NAME,
            str(existing_file.id),
            io.BytesIO(content),
            length=-1,
            part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
        )  # async write chunk to minio
    versions = fs.list_objects(
        settings.MINIO_BUCKET_NAME, prefix=str(existing_file.id), include_version=True
    )
    x = 1


@router.get("/{file_id}")
async def download_file(
    file_id: str,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    # If file exists in MongoDB, download from Minio
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        # Get content type & open file stream
        content = fs.get_object(settings.MINIO_BUCKET_NAME, file_id)
        response = StreamingResponse(content.stream(settings.MINIO_UPLOAD_CHUNK_SIZE))
        response.headers["Content-Disposition"] = (
            "attachment; filename=%s" % file["name"]
        )
        return response


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        dataset = await db["datasets"].find_one({"files": ObjectId(file_id)})
        if dataset is not None:
            updated_dataset = await db["datasets"].update_one(
                {"_id": ObjectId(dataset["id"])},
                {"$push": {"files": ObjectId(file_id)}},
            )
        fs.remove_object(settings.MINIO_BUCKET_NAME, str(file_id))
        return {"deleted": file_id}
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/summary")
async def get_file_summary(
    file_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        return ClowderFile.from_mongo(file)
    raise HTTPException(status_code=404, detail=f"File {file_id} not found")
