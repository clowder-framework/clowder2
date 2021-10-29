import os
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException, Depends, File, UploadFile
from pymongo import MongoClient
from minio import Minio

from app import dependencies
from app.models.files import ClowderFile
from app.auth import AuthHandler

router = APIRouter()

auth_handler = AuthHandler()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")
upload_chunk_size = os.getenv("MINIO_UPLOAD_CHUNK_SIZE", 10 * 1024 * 1024)


@router.post("/files")
async def save_file(
    request: ClowderFile,  # TODO: How to handle default values in request?
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
):
    # First, deal with database and get unique ID
    res = await db["users"].find_one({"_id": ObjectId(user_id)})
    request_json = await request.json()
    request_json["creator"] = res["_id"]
    res = await db["files"].insert_one(request_json)
    found = await db["files"].find_one({"_id": res.inserted_id})

    # Second, use unique ID as key for file storage and add in chunks
    # async with aiopen(tmp_file_path, "wb") as tmp_file: AVOID THIS
    while content := await file.read(upload_chunk_size):  # async read chunk
        await fs.fput_object(
            clowder_bucket,
            res.inserted_id,
            content,
            length=-1,
            part_size=upload_chunk_size,
        )  # async write chunk to minio

    return File.from_mongo(found)


@router.get("/files/{file_id}")
async def get_file(file_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        return File.from_mongo(file)
    raise HTTPException(status_code=404, detail=f"File {file_id} not found")
