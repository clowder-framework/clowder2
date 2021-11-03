import os
from typing import List

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
    fileinfo: Json[ClowderFile] = Form(...),
):
    # First, deal with database and get unique ID
    res = await db["users"].find_one({"_id": ObjectId(user_id)})
    f = dict(fileinfo)
    f["creator"] = res["_id"]
    f["name"] = (
        f["name"] if (len(f["name"]) > 0 and f["name"] != "_NA_") else file.filename
    )
    res = await db["files"].insert_one(f)
    found = await db["files"].find_one({"_id": res.inserted_id})

    # Second, use unique ID as key for file storage
    fs.put_object(
        clowder_bucket,
        str(res.inserted_id),
        file.file,
        length=-1,
        part_size=upload_chunk_size,  # TODO: incorrect
    )  # async write chunk to minio

    return ClowderFile.from_mongo(found)


@router.get("/files/{file_id}")
async def get_file(file_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        return File.from_mongo(file)
    raise HTTPException(status_code=404, detail=f"File {file_id} not found")
