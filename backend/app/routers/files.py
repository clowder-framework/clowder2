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
    connect_elasticsearch,
    insert_record,
    delete_document_by_id,
    update_record,
)
from app.models.files import FileIn, FileOut, FileVersion, FileDB
from app.models.listeners import EventListenerMessage
from app.models.users import UserOut
from app.models.metadata import MetadataOut
from app.models.search import SearchIndexContents
from app.routers.feeds import check_feed_listeners
from app.keycloak_auth import get_user, get_current_user, get_token
from app.rabbitmq.listeners import submit_file_message
from typing import Union

router = APIRouter()
security = HTTPBearer()


async def _resubmit_file_extractors(
    file_id: str,
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: MongoClient = Depends(dependencies.get_db),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
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
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        file_out = FileOut.from_mongo(file)
        query = {"resource.resource_id": ObjectId(file_id)}
        listeners_resubmitted = []
        listeners_resubitted_failed = []
        async for md in db["metadata"].find(query):
            md_out = MetadataOut.from_mongo(md)
            if md_out.agent.listener is not None:
                listener_name = md_out.agent.listener.name
                # TODO find way  to get the parameters used
                parameters = {}
                access_token = credentials.credentials
                queue = listener_name
                routing_key = queue
                try:
                    submit_file_message(
                        file_out,
                        queue,
                        routing_key,
                        parameters,
                        access_token,
                        db,
                        rabbitmq_client,
                    )
                    listeners_resubmitted.append(listener_name)
                except Exception as e:
                    listeners_resubitted_failed.append(listener_name)
        return {"listeners resubmitted successfully": str(listeners_resubmitted), "listeners resubmitted failed": str(listeners_resubmitted)}


# TODO: Move this to MongoDB middle layer
async def add_file_entry(
    file_db: FileDB,
    user: UserOut,
    db: MongoClient,
    fs: Minio,
    file: Optional[io.BytesIO] = None,
    content_type: Optional[str] = None,
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    """Insert FileDB object into MongoDB (makes Clowder ID), then Minio (makes version ID), then update MongoDB with
    the version ID from Minio.

    Arguments:
        file_db: FileDB object controlling dataset and folder destination
        file: bytes to upload
    """
    es = await connect_elasticsearch()

    # Check all connection and abort if any one of them is not available
    if db is None or fs is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

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
    file_out = FileOut(**file_db.dict())

    # Add FileVersion entry and update file
    new_version = FileVersion(
        version_id=version_id,
        file_id=new_file_id,
        creator=user,
        bytes=bytes,
        content_type=file_db.content_type,
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
        "content_type": file_db.content_type,
    }
    insert_record(es, "file", doc, file_db.id)

    # Submit file job to any qualifying feeds
    await check_feed_listeners(es, file_out, user, db)


# TODO: Move this to MongoDB middle layer
async def remove_file_entry(
    file_id: Union[str, ObjectId],
    db: MongoClient,
    fs: Minio,
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    """Remove FileDB object into MongoDB, Minio, and associated metadata and version information."""
    # TODO: Deleting individual versions will require updating version_id in mongo, or deleting entire document

    es = await connect_elasticsearch()

    # Check all connection and abort if any one of them is not available
    if db is None or fs is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return
    fs.remove_object(settings.MINIO_BUCKET_NAME, str(file_id))
    # delete from elasticsearch
    delete_document_by_id(es, "file", str(file_id))
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
    es = await connect_elasticsearch()

    # Check all connection and abort if any one of them is not available
    if db is None or fs is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

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
        # Update entry to the file index
        doc = {
            "doc": {
                "name": updated_file.name,
                "creator": updated_file.creator.email,
                "created": datetime.utcnow(),
                "download": updated_file.downloads,
            }
        }
        update_record(es, "file", doc, updated_file.id)
        await _resubmit_file_extractors(file_id, credentials, db, rabbitmq_client)
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
        await remove_file_entry(file_id, db, fs)
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
    info: Request,  # TODO: Pydantic class?
    token: str = Depends(get_token),
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: MongoClient = Depends(dependencies.get_db),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    """
    Submit file to an extractor.

    :param file_id: UUID of file
    :param info: must include "extractor" field with name, can also include key/value pairs in "parameters"
    """
    req_info = await info.json()
    access_token = credentials.credentials
    if "extractor" not in req_info:
        raise HTTPException(status_code=404, detail=f"No extractor submitted")
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        file_out = FileOut.from_mongo(file)

        # Get extractor info from request (Clowder v1)
        req_headers = info.headers
        raw = req_headers.raw
        authorization = raw[1]
        # TODO this got the wrong thing, changing
        token = authorization[1].decode("utf-8").lstrip("Bearer").lstrip(" ")

        queue = req_info["extractor"]
        parameters = {}
        if "parameters" in req_info:
            parameters = req_info["parameters"]
        routing_key = queue

        submit_file_message(
            file_out, queue, routing_key, parameters, access_token, db, rabbitmq_client
        )

        return {"message": "testing", "file_id": file_id}
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.post("/{file_id}/extract")
async def resubmit_file_extractions(
    file_id: str,
    credentials: HTTPAuthorizationCredentials = Security(security),
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
        resubmit_success_fail = _resubmit_file_extractors(file_id, credentials, db, rabbitmq_client)
    return resubmit_success_fail
