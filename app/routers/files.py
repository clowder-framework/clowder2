import os
import io
from typing import List, Optional
from datetime import datetime

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
from app.models.files import ClowderFile, FileVersion
from app.auth import AuthHandler
from app.config import settings

router = APIRouter()

auth_handler = AuthHandler()


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

    # Get new version ID from Minio, update version/creator/created flags
    updated_file = dict(existing_file)
    updated_file["creator"] = user["id"]
    updated_file["created"] = datetime.utcnow
    minio_versions = fs.list_objects(
        settings.MINIO_BUCKET_NAME,
        prefix=file_id,
        include_version=True,
    )
    for version in minio_versions:
        if version._is_latest:
            updated_file["version"] = version.version_id
    await db["files"].update(updated_file)

    return ClowderFile.from_mongo(updated_file)


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
        # Increment download count
        await db["files"].update_one(
            {"_id": ObjectId(file_id)}, {"$inc": {"downloads": 1}}
        )
        return response
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        if (
            dataset := await db["datasets"].find_one({"files": ObjectId(file_id)})
        ) is not None:
            updated_dataset = await db["datasets"].update_one(
                {"_id": ObjectId(dataset["id"])},
                {"$pull": {"files": ObjectId(file_id)}},
            )

        removed_file = await db["files"].delete_one({"_id": ObjectId(file_id)})
        fs.remove_object(settings.MINIO_BUCKET_NAME, str(file_id))
        return {"deleted": file_id}
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/summary")
async def get_file_summary(
    file_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    versions: bool = True,
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        # TODO: Incrementing too often (3x per page view)
        # file["views"] += 1
        # db["files"].replace_one({"_id": ObjectId(file_id)}, file)
        response = ClowderFile.from_mongo(file)

        if versions:
            file_versions = []
            minio_versions = fs.list_objects(
                settings.MINIO_BUCKET_NAME,
                prefix=file_id,
                include_version=True,
            )
            for version in minio_versions:
                file_versions.append(
                    {
                        "version_id": version._version_id,
                        "latest": version._is_latest,
                        "modified": version._last_modified,
                    }
                )
            # response["versions"] = file_versions
            return file_versions
        else:
            return response
    raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.put("/{file_id}", response_model=ClowderFile)
async def edit_file(
    file_info: ClowderFile, file_id: str, db: MongoClient = Depends(dependencies.get_db)
):
    # TODO: Needs permissions checking here
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        try:
            file.update(file_info)
            # TODO: Disallow changing other fields such as author
            file["_id"] = file_id
            db["files"].replace_one({"_id": ObjectId(file_id)}, file)
        except Exception as e:
            print(e)
        return ClowderFile.from_mongo(file)
    raise HTTPException(status_code=404, detail=f"File {file_id} not found")
