import io
import json

from elasticsearch import Elasticsearch
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
from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.responses import StreamingResponse
from minio import Minio
from pika.adapters.blocking_connection import BlockingChannel
from pymongo import MongoClient

from app import dependencies
from app.config import settings
from app.search.connect import (
    insert_record,
    delete_document_by_id,
    update_record,
    delete_document_by_query,
)
from app.models.files import FileIn, FileOut, FileVersion, FileContentType, FileDB
from app.models.users import UserOut
from app.routers.feeds import check_feed_listeners
from app.keycloak_auth import get_user, get_current_user, get_token
from app.rabbitmq.listeners import submit_file_job, submit_file_job
from typing import Union
from app.models.metadata import MetadataOut

router = APIRouter()
security = HTTPBearer()


async def _resubmit_file_extractors(
    file: FileOut,
    db: MongoClient,
    rabbitmq_client: BlockingChannel,
    user: UserOut,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """This helper method will check metadata. We get the extractors run from metadata from extractors.
    Then they are resubmitted. At present parameters are not stored. This will change once Jobs are
    implemented.

        Arguments:
        file_id: Id of file
        credentials: credentials of logged in user
        db: MongoDB Client
        rabbitmq_client: Rabbitmq Client

    """
    previous_version = file.version_num - 1
    query = {
        "resource_ref.resource_id": ObjectId(file.id),
        "resource_ref.version": previous_version,
    }
    listeners_resubmitted = []
    listeners_resubitted_failed = []
    resubmitted_jobs = []
    async for job in db["listener_jobs"].find(query):
        current_job = job
        job_listener_queue = job["listener_id"]
        job_parameters = job["parameters"]
        resubmitted_job = {
            "listener_id": job_listener_queue,
            "parameters": job_parameters,
        }
        try:
            routing_key = job_listener_queue
            access_token = credentials.credentials
            await submit_file_job(
                file,
                job_listener_queue,
                routing_key,
                job_parameters,
                user,
                db,
                rabbitmq_client,
                access_token,
            )
            resubmitted_job["status"] = "success"
            resubmitted_jobs.append(resubmitted_job)
        except Exception as e:
            resubmitted_job["status"] = "error"
            resubmitted_jobs.append(resubmitted_job)

    return resubmitted_jobs


# TODO: Move this to MongoDB middle layer
async def add_file_entry(
    file_db: FileDB,
    user: UserOut,
    db: MongoClient,
    fs: Minio,
    es: Elasticsearch,
    rabbitmq_client: BlockingChannel,
    token: str,
    file: Optional[io.BytesIO] = None,
    content_type: Optional[str] = None,
):
    """Insert FileDB object into MongoDB (makes Clowder ID), then Minio (makes version ID), then update MongoDB with
    the version ID from Minio.

    Arguments:
        file_db: FileDB object controlling dataset and folder destination
        file: bytes to upload
    """

    # Check all connection and abort if any one of them is not available
    if db is None or fs is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    new_file = await db["files"].insert_one(file_db.to_mongo())
    new_file_id = new_file.inserted_id
    if content_type is None:
        content_type = mimetypes.guess_type(file_db.name)
        content_type = content_type[0] if len(content_type) > 1 else content_type
    type_main = content_type.split("/")[0] if type(content_type) is str else "N/A"
    content_type_obj = FileContentType(content_type=content_type, main_type=type_main)

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
    file_db.content_type = content_type_obj
    await db["files"].replace_one({"_id": ObjectId(new_file_id)}, file_db.to_mongo())
    file_out = FileOut(**file_db.dict())

    # Add FileVersion entry and update file
    new_version = FileVersion(
        file_id=new_file_id,
        creator=user,
        version_id=version_id,
        bytes=bytes,
    )
    await db["file_versions"].insert_one(new_version.to_mongo())

    # Add entry to the file index
    doc = {
        "name": file_db.name,
        "creator": file_db.creator.email,
        "created": file_db.created,
        "download": file_db.downloads,
        "dataset_id": str(file_db.dataset_id),
        "folder_id": str(file_db.folder_id),
        "bytes": file_db.bytes,
        "content_type": content_type_obj.content_type,
        "content_type_main": content_type_obj.main_type,
    }
    insert_record(es, "file", doc, file_db.id)

    # Submit file job to any qualifying feeds
    await check_feed_listeners(es, file_out, user, db, rabbitmq_client, token)


# TODO: Move this to MongoDB middle layer
async def remove_file_entry(
    file_id: Union[str, ObjectId], db: MongoClient, fs: Minio, es: Elasticsearch
):
    """Remove FileDB object into MongoDB, Minio, and associated metadata and version information."""
    # TODO: Deleting individual versions will require updating version_id in mongo, or deleting entire document

    # Check all connection and abort if any one of them is not available
    if db is None or fs is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return
    fs.remove_object(settings.MINIO_BUCKET_NAME, str(file_id))
    # delete from elasticsearch
    delete_document_by_id(es, "file", str(file_id))
    query = {"match": {"resource_id": str(file_id)}}
    delete_document_by_query(es, "metadata", query)
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
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    credentials: HTTPAuthorizationCredentials = Security(security),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    # Check all connection and abort if any one of them is not available
    if db is None or fs is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    if (file_q := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        updated_file = FileOut.from_mongo(file_q)

        if (
            file.filename != updated_file.name
            or file.content_type != updated_file.content_type.content_type
        ):
            raise HTTPException(
                status_code=400,
                detail=f"File name and content type must match existing: {updated_file.name} & {updated_file.content_type}",
            )

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

        # Update byte size
        updated_file.bytes = len(
            fs.get_object(settings.MINIO_BUCKET_NAME, str(updated_file.id)).data
        )

        await db["files"].replace_one(
            {"_id": ObjectId(file_id)}, updated_file.to_mongo()
        )

        # Put entry in FileVersion collection
        new_version = FileVersion(
            file_id=updated_file.id,
            creator=user,
            version_id=updated_file.version_id,
            version_num=updated_file.version_num,
            bytes=updated_file.bytes,
        )

        await db["file_versions"].insert_one(new_version.to_mongo())
        # Update entry to the file index
        doc = {
            "doc": {
                "name": updated_file.name,
                "creator": updated_file.creator.email,
                "created": datetime.utcnow(),
                "download": updated_file.downloads,
                "bytes": updated_file.bytes,
                "content_type": updated_file.content_type.content_type,
            }
        }
        update_record(es, "file", doc, updated_file.id)
        await _resubmit_file_extractors(
            updated_file, db, rabbitmq_client, user, credentials
        )

        # updating metadata in elasticsearch
        if (
            metadata := await db["metadata"].find_one(
                {"resource.resource_id": ObjectId(updated_file.id)}
            )
        ) is not None:
            doc = {
                "doc": {
                    "name": updated_file.name,
                    "content_type": updated_file.content_type.content_type,
                    "resource_created": updated_file.created.utcnow(),
                    "resource_creator": updated_file.creator.email,
                    "bytes": updated_file.bytes,
                }
            }
            update_record(es, "metadata", doc, str(metadata["_id"]))
        return updated_file
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}")
async def download_file(
    file_id: str,
    version: Optional[int] = None,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    # If file exists in MongoDB, download from Minio
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        file_obj = FileOut.from_mongo(file)
        if version is not None:
            # Version is specified, so get the minio ID from versions table if possible
            if (
                file_vers := await db["file_versions"].find_one(
                    {"file_id": ObjectId(file_id), "version_num": version}
                )
            ) is not None:
                vers = FileVersion.from_mongo(file_vers)
                content = fs.get_object(
                    settings.MINIO_BUCKET_NAME, file_id, version_id=vers.version_id
                )
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"File {file_id} version {version} not found",
                )
        else:
            # If no version specified, get latest version directly
            content = fs.get_object(settings.MINIO_BUCKET_NAME, file_id)

        # Get content type & open file stream
        response = StreamingResponse(content.stream(settings.MINIO_UPLOAD_CHUNK_SIZE))
        response.headers["Content-Disposition"] = (
            "attachment; filename=%s" % file_obj.name
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
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        await remove_file_entry(file_id, db, fs, es)
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


# submits file to extractor
# can handle parameters pass in as key/values in info
@router.post("/{file_id}/extract")
async def get_file_extract(
    file_id: str,
    extractorName: str,
    request: Request,
    # parameters don't have a fixed model shape
    parameters: dict = None,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: MongoClient = Depends(dependencies.get_db),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    if extractorName is None:
        raise HTTPException(status_code=400, detail=f"No extractorName specified")
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        file_out = FileOut.from_mongo(file)
        access_token = credentials.credentials

        # backward compatibility? Get extractor info from request (Clowder v1)
        queue = extractorName
        routing_key = queue

        if parameters is None:
            parameters = {}

        await submit_file_job(
            file_out,
            queue,
            routing_key,
            parameters,
            user,
            access_token,
            db,
            rabbitmq_client,
        )

        return {"message": "testing", "file_id": file_id}
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.post("/{file_id}/resubmit_extract")
async def resubmit_file_extractions(
    file_id: str,
    credentials: HTTPAuthorizationCredentials = Security(security),
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    """This route will check metadata. We get the extractors run from metadata from extractors.
    Then they are resubmitted. At present parameters are not stored. This will change once Jobs are
    implemented.

        Arguments:
        file_id: Id of file
        credentials: credentials of logged in user
        db: MongoDB Client
        rabbitmq_client: Rabbitmq Client

    """
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        resubmit_success_fail = _resubmit_file_extractors(
            file_id, db, rabbitmq_client, user, credentials
        )
    return resubmit_success_fail
