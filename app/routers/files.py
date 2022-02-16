import io
from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    File,
    UploadFile,
)
from fastapi.responses import StreamingResponse
from minio import Minio
from pydantic import Json
from pymongo import MongoClient

from app import dependencies
from app.auth import AuthHandler
from app.config import settings
from app.models.files import ClowderFile, FileVersion
from app.models.users import UserOut

router = APIRouter()

auth_handler = AuthHandler()


@router.put("/{file_id}", response_model=ClowderFile)
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
    user_q = await db["users"].find_one({"_id": ObjectId(user_id)})
    user = UserOut(**user_q)
    # TODO: Harden this piece for when data is missing
    existing_q = await db["files"].find_one({"_id": ObjectId(file_id)})
    existing_file = ClowderFile.from_mongo(existing_q)

    # Update file in Minio and get the new version IDs
    version_id = None
    while content := file.file.read(
        settings.MINIO_UPLOAD_CHUNK_SIZE
    ):  # async read chunk
        response = fs.put_object(
            settings.MINIO_BUCKET_NAME,
            str(existing_file.id),
            io.BytesIO(content),
            length=-1,
            part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
        )  # async write chunk to minio
        version_id = response.version_id

    # Update version/creator/created flags
    updated_file = dict(existing_file)
    updated_file["name"] = file.filename
    updated_file["creator"] = user.id
    updated_file["created"] = datetime.utcnow()
    updated_file["version"] = version_id
    # TODO: How to avoid this ID field shuffling? Omit ClowderFile() conversion?
    updated_file["_id"] = existing_file.id
    del updated_file["id"]
    await db["files"].replace_one({"_id": ObjectId(file_id)}, updated_file)

    # Put entry in FileVersion collection
    new_version = FileVersion(
        version_id=updated_file["version"],
        file_id=existing_file.id,
        creator=user.id,
    )
    await db["file_versions"].insert_one(dict(new_version))
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

        # TODO: Deleting individual versions may require updating version_id in mongo, or deleting entire document
        fs.remove_object(settings.MINIO_BUCKET_NAME, str(file_id))
        removed_file = await db["files"].delete_one({"_id": ObjectId(file_id)})
        removed_vers = await db["file_versions"].delete({"file_id": ObjectId(file_id)})
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
        # TODO: Incrementing too often (3x per page view)
        # file["views"] += 1
        # db["files"].replace_one({"_id": ObjectId(file_id)}, file)
        return ClowderFile.from_mongo(file)

    raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/versions")
async def get_file_versions(
    file_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    skip: int = 0,
    limit: int = 20,
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        """
        # DEPRECATED: Gett version information from Minio directly (no creator field)
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
        return file_versions
        """

        mongo_versions = []
        for ver in (
            await db["file_versions"]
            .find({"file_id": ObjectId(file_id)})
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            mongo_versions.append(FileVersion.from_mongo(ver))
        return mongo_versions

    raise HTTPException(status_code=404, detail=f"File {file_id} not found")
