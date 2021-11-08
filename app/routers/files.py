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

router = APIRouter()

auth_handler = AuthHandler()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")
upload_chunk_size = os.getenv("MINIO_UPLOAD_CHUNK_SIZE", 10 * 1024 * 1024)


@router.post("/files")
async def save_file(
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
    file_info: Optional[Json[ClowderFile]] = None,
):
    # First, add to database and get unique ID
    f = dict(file_info) if file_info is not None else {}
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    f["name"] = file.filename
    f["creator"] = user["_id"]
    new_file = await db["files"].insert_one(f)
    found = await db["files"].find_one({"_id": new_file.inserted_id})

    # Second, use unique ID as key for file storage
    while content := file.file.read(upload_chunk_size):  # async read chunk
        fs.put_object(
            clowder_bucket,
            str(new_file.inserted_id),
            io.BytesIO(content),
            length=-1,
            part_size=upload_chunk_size,
        )  # async write chunk to minio

    return ClowderFile.from_mongo(found)


@router.get("/files/{file_id}")
async def download_file(
    file_id: str,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    # If file exists in MongoDB, download from Minio
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        # Get content type & open file stream
        content = fs.get_object(clowder_bucket, file_id)
        response = StreamingResponse(content.stream(upload_chunk_size))
        response.headers["Content-Disposition"] = (
            "attachment; filename=%s" % file["name"]
        )
        return response


@router.get("/files/{file_id}/summary")
async def get_file_summary(
    file_id: str, db: MongoClient = Depends(dependencies.get_db)
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        return ClowderFile.from_mongo(file)
    raise HTTPException(status_code=404, detail=f"File {file_id} not found")
