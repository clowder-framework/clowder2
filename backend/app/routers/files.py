import io
import json
import pika
import mimetypes
from datetime import datetime
from typing import Optional, List, BinaryIO
from bson import ObjectId
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    File,
    Form,
    UploadFile,
    Request,
)
from fastapi.responses import StreamingResponse
from minio import Minio
from pika.adapters.blocking_connection import BlockingChannel
from pydantic import Json
from pymongo import MongoClient

from app import dependencies
from app.config import settings
from app.models.files import FileIn, FileOut, FileVersion, FileDB
from app.models.users import UserOut
from app.keycloak_auth import get_user, get_current_user, get_token

router = APIRouter()


async def add_file_entry(
    file_db: FileDB,
    user: UserOut,
    db: MongoClient,
    fs: Minio,
    file: Optional[io.BytesIO] = None,
    content_type: Optional[str] = None,
):
    """Insert FileDB object into MongoDB (makes Clowder ID), then Minio (makes version ID), then update MongoDB with
    the version ID from Minio.

    Arguments:
        file_db: FileDB object controlling dataset and folder destination
        file: bytes to upload
    """
    new_file = await db["files"].insert_one(file_db.to_mongo())
    new_file_id = new_file.inserted_id
    if content_type is None:
        content_type = mimetypes.guess_type(file_db.name)
    content_type = content_type[0] if len(content_type) > 1 else content_type

    # Use unique ID as key for Minio and get initial version ID
    response = fs.put_object(
        settings.MINIO_BUCKET_NAME,
        str(new_file_id),
        file,
        length=-1,
        part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
    )  # async write chunk to minio
    version_id = response.version_id
    bytes = len(fs.get_object(settings.MINIO_BUCKET_NAME, str(new_file_id)).data)
    if version_id is None:
        # TODO: This occurs in testing when minio is not running
        version_id = 999999999
    file_db.version_id = version_id
    file_db.version_num = 1
    file_db.bytes = bytes
    file_db.content_type = content_type if type(content_type) is str else "N/A"
    await db["files"].replace_one({"_id": ObjectId(new_file_id)}, file_db.to_mongo())

    # Add FileVersion entry and update file
    new_version = FileVersion(
        version_id=version_id,
        file_id=new_file_id,
        creator=user,
        bytes=bytes,
        content_type=file_db.content_type,
    )
    await db["file_versions"].insert_one(new_version.to_mongo())


async def remove_file_entry(
    file_id: str,
    db: MongoClient,
    fs: Minio,
):
    """Remove FileDB object into MongoDB, Minio, and associated metadata and version information."""
    # TODO: Deleting individual versions will require updating version_id in mongo, or deleting entire document
    fs.remove_object(settings.MINIO_BUCKET_NAME, str(file_id))
    await db["files"].delete_one({"_id": ObjectId(file_id)})
    await db.metadata.delete_many({"resource.resource_id": ObjectId(file_id)})
    await db["file_versions"].delete_many({"file_id": ObjectId(file_id)})


@router.put("/{file_id}", response_model=FileOut)
async def update_file(
    file_id: str,
    token=Depends(get_token),
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
):
    if (file_q := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        # First, add to database and get unique ID
        updated_file = FileOut.from_mongo(file_q)

        # Update file in Minio and get the new version IDs
        version_id = None
        while content := file.file.read(
            settings.MINIO_UPLOAD_CHUNK_SIZE
        ):  # async read chunk
            response = fs.put_object(
                settings.MINIO_BUCKET_NAME,
                str(updated_file.id),
                io.BytesIO(content),
                length=-1,
                part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
            )  # async write chunk to minio
            version_id = response.version_id

        # Update version/creator/created flags
        updated_file.name = file.filename
        updated_file.creator = user
        updated_file.created = datetime.utcnow()
        updated_file.version_id = version_id
        updated_file.version_num = updated_file.version_num + 1
        await db["files"].replace_one(
            {"_id": ObjectId(file_id)}, updated_file.to_mongo()
        )

        # Put entry in FileVersion collection
        new_version = FileVersion(
            version_id=updated_file.version_id,
            version_num=updated_file.version_num,
            file_id=updated_file.id,
            creator=user,
        )
        await db["file_versions"].insert_one(new_version.to_mongo())
        return updated_file
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}")
async def download_file(
    file_id: str,
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
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        remove_file_entry(file_id, db, fs)
        return {"deleted": file_id}
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/summary")
async def get_file_summary(
    file_id: str,
    db: MongoClient = Depends(dependencies.get_db),
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        # TODO: Incrementing too often (3x per page view)
        # file["views"] += 1
        # db["files"].replace_one({"_id": ObjectId(file_id)}, file)
        return FileOut.from_mongo(file)

    raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/versions", response_model=List[FileVersion])
async def get_file_versions(
    file_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 20,
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        """
        # DEPRECATED: Get version information from Minio directly (no creator field)
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


@router.post("/{file_id}/extract")
async def get_file_extract(
    file_id: str,
    info: Request,
    db: MongoClient = Depends(dependencies.get_db),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        req_info = await info.json()
        if 'extractor' in req_info:
            msg = {"message": "testing", "file_id": file_id}
            body = {}
            body['host'] = 'http://127.0.0.1:8000'
            body['secretKey'] = 'secretKey'
            body['retry_count'] = 0
            body['filename'] = file['name']
            body['id'] = file_id
            body['datasetId'] = str(file['dataset_id'])
            body['host'] = 'http://127.0.0.1:8000'
            body['secretKey'] = 'secretKey'
            body['fileSize'] = file['bytes']
            body['resource_type'] = 'file'
            body['flags'] = ""
            current_queue = req_info['extractor']
            if 'parameters' in req_info:
                current_parameters = req_info['parameters']
            current_routing_key = 'extractors.' + current_queue
            rabbitmq_client.queue_bind(exchange='extractors', queue=current_queue, routing_key=current_routing_key)
            rabbitmq_client.basic_publish(
                exchange="extractors",
                routing_key=current_routing_key,
                body=json.dumps(body, ensure_ascii=False),
                properties=pika.BasicProperties(content_type="application/json", delivery_mode=1),

            )
            return msg
        else:
            raise HTTPException(status_code=404, detail=f"No extractor submitted")
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")
