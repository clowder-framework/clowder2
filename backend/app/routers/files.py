import io
import time
from datetime import datetime, timedelta
from typing import List, Optional, Union
import json
from json import JSONEncoder
from aio_pika import Message
from app import dependencies
from app.config import settings
from app.db.file.download import _increment_file_downloads
from app.deps.authorization_deps import FileAuthorization
from app.keycloak_auth import get_current_user, get_token
from app.models.files import (
    FileDB,
    FileDBViewList,
    FileOut,
    FileVersion,
    FileVersionDB,
    StorageType,
)
from app.models.metadata import MetadataDB
from app.models.thumbnails import ThumbnailDB
from app.models.users import UserOut
from app.rabbitmq.listeners import EventListenerJobDB, submit_file_job
from app.routers.feeds import check_feed_listeners
from app.routers.utils import get_content_type
from app.search.connect import insert_record, update_record, delete_document_by_id
from app.search.index import index_file, index_thumbnail
from beanie import PydanticObjectId
from beanie.odm.operators.find.logical import Or
from bson import ObjectId
from elasticsearch import Elasticsearch, NotFoundError
from fastapi import APIRouter, Depends, File, HTTPException, Security, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from minio import Minio
from pika.adapters.blocking_connection import BlockingChannel

router = APIRouter()
security = HTTPBearer()

class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, PydanticObjectId):
            return str(obj)
        # Handle other non-serializable types if needed
        return super().default(obj)


async def _resubmit_file_extractors(
    file: FileOut,
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
        rabbitmq_client: Rabbitmq Client

    """
    resubmitted_jobs = []
    async for job in EventListenerJobDB.find(
        EventListenerJobDB.resource_ref.resource_id == PydanticObjectId(file.id),
        EventListenerJobDB.resource_ref.version == file.version_num - 1,
    ):
        resubmitted_job = {"listener_id": job.listener_id, "parameters": job.parameters}
        try:
            routing_key = job.listener_id
            access_token = credentials.credentials
            await submit_file_job(
                file,
                routing_key,
                job.parameters,
                user,
                rabbitmq_client,
                access_token,
            )
            resubmitted_job["status"] = "success"
            resubmitted_jobs.append(resubmitted_job)
        except Exception:
            resubmitted_job["status"] = "error"
            resubmitted_jobs.append(resubmitted_job)
    return resubmitted_jobs


# TODO: Move this to MongoDB middle layer
async def add_file_entry(
    new_file: FileDB,
    user: UserOut,
    fs: Minio,
    es: Elasticsearch,
    rabbitmq_client: BlockingChannel,
    file: Optional[io.BytesIO] = None,
    content_type: Optional[str] = None,
    public: bool = False,
    authenticated: bool = False,
):
    """Insert FileDB object into MongoDB (makes Clowder ID), then Minio (makes version ID), then update MongoDB with
    the version ID from Minio.

    Arguments:
        file_db: FileDB object controlling dataset and folder destination
        file: bytes to upload
    """

    await new_file.insert()
    new_file_id = new_file.id
    content_type_obj = get_content_type(new_file.name, content_type)

    # Use unique ID as key for Minio and get initial version ID
    response = fs.put_object(
        settings.MINIO_BUCKET_NAME,
        str(new_file_id),
        file,
        length=-1,
        part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
        content_type=new_file.content_type.content_type,
    )  # async write chunk to minio
    version_id = response.version_id
    bytes = len(fs.get_object(settings.MINIO_BUCKET_NAME, str(new_file_id)).data)
    if version_id is None:
        # TODO: This occurs in testing when minio is not running
        version_id = 999999999
    new_file.version_id = version_id
    new_file.version_num = 1
    new_file.bytes = bytes
    new_file.content_type = content_type_obj
    await new_file.replace()

    # Add FileVersion entry and update file
    new_version = FileVersionDB(
        file_id=new_file_id,
        creator=user,
        version_id=version_id,
        bytes=bytes,
    )
    await new_version.insert()

    # Add entry to the file index
    await index_file(es, FileOut(**new_file.dict()))

    # Publish a message when indexing is complete

    message_body = {
        "event_type": "file_indexed",
        "file_data": json.loads(new_file.json()),  # This handles ObjectID serialization
        "timestamp": datetime.now().isoformat()
    }

    rabbitmq_client.basic_publish(
        exchange='clowder',
        routing_key='file_indexed_events',
        body=json.dumps(message_body).encode('utf-8')
    )

    # TODO - timing issue here, check_feed_listeners needs to happen asynchronously.
    time.sleep(1)

    # Submit file job to any qualifying feeds
    await check_feed_listeners(
        es,
        FileOut(**new_file.dict()),
        user,
        rabbitmq_client,
    )


async def add_local_file_entry(
    new_file: FileDB,
    user: UserOut,
    es: Elasticsearch,
    rabbitmq_client: BlockingChannel,
    content_type: Optional[str] = None,
):
    """Insert FileDB object into MongoDB (makes Clowder ID). Bytes are not stored in DB and versioning not supported
    for local files."""

    content_type_obj = get_content_type(new_file.name, content_type)
    new_file.content_type = content_type_obj
    await new_file.insert()

    # Add entry to the file index
    await index_file(es, FileOut(**new_file.dict()))
    # Publish a message when indexing is complete
    message_body = {
        "event_type": "file_indexed",
        "file_data": json.loads(new_file.json()),  # This handles ObjectID serialization
        "timestamp": datetime.now().isoformat()
    }

    rabbitmq_client.basic_publish(
        exchange='clowder',
        routing_key='file_indexed_events',
        body=json.dumps(message_body).encode('utf-8')
    )

    # TODO - timing issue here, check_feed_listeners needs to happen asynchronously.
    time.sleep(1)

    # Submit file job to any qualifying feeds
    await check_feed_listeners(
        es,
        FileOut(**new_file.dict()),
        user,
        rabbitmq_client,
    )


# TODO: Move this to MongoDB middle layer
async def remove_file_entry(
    file_id: Union[str, ObjectId], fs: Minio, es: Elasticsearch
):
    """Remove FileDB object into MongoDB, Minio, and associated metadata and version information."""
    # TODO: Deleting individual versions will require updating version_id in mongo, or deleting entire document
    fs.remove_object(settings.MINIO_BUCKET_NAME, str(file_id))
    # delete from elasticsearch
    delete_document_by_id(es, settings.elasticsearch_index, str(file_id))
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        await file.delete()
    await MetadataDB.find(
        MetadataDB.resource.resource_id == PydanticObjectId(file_id)
    ).delete()
    await FileVersionDB.find(
        FileVersionDB.file_id == PydanticObjectId(file_id)
    ).delete()


async def remove_local_file_entry(file_id: Union[str, ObjectId], es: Elasticsearch):
    """Remove FileDB object into MongoDB, Minio, and associated metadata and version information."""
    # TODO: Deleting individual versions will require updating version_id in mongo, or deleting entire document
    # delete from elasticsearch
    delete_document_by_id(es, settings.elasticsearch_index, str(file_id))
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        # TODO: delete from disk - should this be allowed if Clowder didn't originally write the file?
        # os.path.remove(file.storage_path)
        await file.delete()
    await MetadataDB.find(
        MetadataDB.resource.resource_id == PydanticObjectId(file_id)
    ).delete()


@router.put("/{file_id}", response_model=FileOut)
async def update_file(
    file_id: str,
    token=Depends(get_token),
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    credentials: HTTPAuthorizationCredentials = Security(security),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    allow: bool = Depends(FileAuthorization("uploader")),
):
    # Check all connection and abort if any one of them is not available
    if fs is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    if (updated_file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        if (
            file.filename != updated_file.name
            or file.content_type != updated_file.content_type.content_type
        ):
            raise HTTPException(
                status_code=400,
                detail=f"File name and content type must match existing: {updated_file.name} & {updated_file.content_type}",
            )

        # Update file in Minio and get the new version IDs
        response = fs.put_object(
            settings.MINIO_BUCKET_NAME,
            str(updated_file.id),
            file.file,
            length=-1,
            part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
            content_type=updated_file.content_type.content_type,
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
        await updated_file.replace()

        # Put entry in FileVersion collection
        new_version = FileVersionDB(
            file_id=updated_file.id,
            creator=user,
            version_id=updated_file.version_id,
            version_num=updated_file.version_num,
            bytes=updated_file.bytes,
        )

        await new_version.insert()
        # Update entry to the file index
        await index_file(es, FileOut(**updated_file.dict()), update=True)
        await _resubmit_file_extractors(
            FileOut(**updated_file.dict()),
            rabbitmq_client=rabbitmq_client,
            user=user,
            credentials=credentials,
        )

        # updating metadata in elasticsearch
        metadata = await MetadataDB.find_one(
            MetadataDB.resource.resource_id == PydanticObjectId(updated_file.id)
        )
        if metadata:
            doc = {
                "doc": {
                    "name": updated_file.name,
                    "content_type": updated_file.content_type.content_type,
                    "resource_created": updated_file.created.utcnow(),
                    "resource_creator": updated_file.creator.email,
                    "bytes": updated_file.bytes,
                }
            }
            try:
                update_record(es, "metadata", {"doc": doc}, str(metadata.id))
            except NotFoundError:
                insert_record(es, "metadata", doc, str(metadata.id))
        return updated_file.dict()
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}")
async def download_file(
    file_id: str,
    version: Optional[int] = None,
    increment: Optional[bool] = True,
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    fs: Minio = Depends(dependencies.get_fs),
    allow: bool = Depends(FileAuthorization("viewer")),
):
    # If file exists in MongoDB, download from Minio
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        # find the bytes id
        # if it's working draft file_id == origin_id
        # if it's published origin_id points to the raw bytes
        bytes_file_id = str(file.origin_id) if file.origin_id else str(file.id)

        if file.storage_type == StorageType.MINIO:
            if version is not None:
                # Version is specified, so get the minio ID from versions table if possible
                file_vers = await FileVersionDB.find_one(
                    Or(
                        FileVersionDB.file_id == PydanticObjectId(file_id),
                        FileVersionDB.file_id == file.origin_id,
                    ),
                    FileVersionDB.version_num == version,
                )
                if file_vers is not None:
                    vers = FileVersion(**file_vers.dict())
                    content = fs.get_object(
                        settings.MINIO_BUCKET_NAME,
                        bytes_file_id,
                        version_id=vers.version_id,
                    )
                else:
                    raise HTTPException(
                        status_code=404,
                        detail=f"File {file_id} version {version} not found",
                    )
            else:
                # If no version specified, get latest version directly
                content = fs.get_object(settings.MINIO_BUCKET_NAME, bytes_file_id)

            # Get content type & open file stream
            response = StreamingResponse(
                content.stream(settings.MINIO_UPLOAD_CHUNK_SIZE)
            )
            response.headers["Content-Disposition"] = (
                "attachment; filename=%s" % file.name
            )

        elif file.storage_type == StorageType.LOCAL:
            response = FileResponse(
                path=file.storage_path,
                filename=file.name,
                media_type=file.content_type.content_type,
            )

        else:
            raise HTTPException(
                status_code=400, detail=f"Unable to download {file_id}."
            )

        if response:
            if increment:
                await _increment_file_downloads(file_id)

                # reindex
                await index_file(es, FileOut(**file.dict()), update=True)

            return response

    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/url/")
async def download_file_url(
    file_id: str,
    version: Optional[int] = None,
    expires_in_seconds: Optional[int] = 3600,
    increment: Optional[bool] = True,
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    external_fs: Minio = Depends(dependencies.get_external_fs),
    allow: bool = Depends(FileAuthorization("viewer")),
):
    # If file exists in MongoDB, download from Minio
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        # find the bytes id
        # if it's working draft file_id == origin_id
        # if it's published origin_id points to the raw bytes
        bytes_file_id = str(file.origin_id) if file.origin_id else str(file.id)
        if expires_in_seconds is None:
            expires = timedelta(seconds=settings.MINIO_EXPIRES)
        else:
            expires = timedelta(seconds=expires_in_seconds)

        if version is not None:
            # Version is specified, so get the minio ID from versions table if possible
            file_vers = await FileVersionDB.find_one(
                Or(
                    FileVersionDB.file_id == ObjectId(file_id),
                    FileVersionDB.file_id == file.origin_id,
                ),
                FileVersionDB.version_num == version,
            )
            if file_vers is not None:
                vers = FileVersion(**file_vers.dict())
                # If no version specified, get latest version directly
                presigned_url = external_fs.presigned_get_object(
                    bucket_name=settings.MINIO_BUCKET_NAME,
                    object_name=bytes_file_id,
                    version_id=vers.version_id,
                    expires=expires,
                )
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"File {file_id} version {version} not found",
                )
        else:
            # If no version specified, get latest version directly
            presigned_url = external_fs.presigned_get_object(
                bucket_name=settings.MINIO_BUCKET_NAME,
                object_name=bytes_file_id,
                expires=expires,
            )

        if presigned_url is not None:
            if increment:
                await _increment_file_downloads(file_id)
                # reindex
                await index_file(es, FileOut(**file.dict()), update=True)
                # return presigned url
            return {"presigned_url": presigned_url}
        else:
            raise HTTPException(
                status_code=500, detail="Unable to generate presigned URL"
            )
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(FileAuthorization("editor")),
):
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        if file.storage_type == StorageType.LOCAL:
            await remove_local_file_entry(file_id, es)
        else:
            await remove_file_entry(file_id, fs, es)
        return {"deleted": file_id}
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/summary", response_model=FileOut)
async def get_file_summary(
    file_id: str,
    allow: bool = Depends(FileAuthorization("viewer")),
):
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        # TODO: Incrementing too often (3x per page view)
        # file.views += 1
        # await file.replace()
        return file.dict()
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/version_details", response_model=FileOut)
async def get_file_version_details(
    file_id: str,
    version_num: Optional[int] = 0,
    allow: bool = Depends(FileAuthorization("viewer")),
):
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        # TODO: Incrementing too often (3x per page view)
        file_vers = await FileVersionDB.find_one(
            Or(
                FileVersionDB.file_id == ObjectId(file_id),
                FileVersionDB.file_id == file.origin_id,
            ),
            FileVersionDB.version_num == version_num,
        )
        file_vers_dict = file_vers.dict()
        file_vers_details = file.copy()
        file_vers_keys = list(file_vers.keys())
        for file_vers_key in file_vers_keys:
            file_vers_details[file_vers_key] = file_vers_dict[file_vers_key]
        return file_vers_details
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/versions", response_model=List[FileVersion])
async def get_file_versions(
    file_id: str,
    skip: int = 0,
    limit: int = 20,
    allow: bool = Depends(FileAuthorization("viewer")),
):
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        mongo_versions = []
        if file.storage_type == StorageType.MINIO:
            async for ver in (
                FileVersionDB.find(
                    Or(
                        FileVersionDB.file_id == PydanticObjectId(file_id),
                        FileVersionDB.file_id == file.origin_id,
                    )
                )
                .sort(-FileVersionDB.created)
                .skip(skip)
                .limit(limit)
            ):
                mongo_versions.append(FileVersion(**ver.dict()))
        return mongo_versions

    raise HTTPException(status_code=404, detail=f"File {file_id} not found")


# submits file to extractor
@router.post("/{file_id}/extract")
async def post_file_extract(
    file_id: str,
    extractorName: str,
    # parameters don't have a fixed model shape
    parameters: dict = None,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    allow: bool = Depends(FileAuthorization("uploader")),
):
    if extractorName is None:
        raise HTTPException(status_code=400, detail="No extractorName specified")
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        # backward compatibility? Get extractor info from request (Clowder v1)
        queue = extractorName
        routing_key = queue
        if parameters is None:
            parameters = {}
        return await submit_file_job(
            FileOut(**file.dict()),
            routing_key,
            parameters,
            user,
            rabbitmq_client,
        )
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.post("/{file_id}/resubmit_extract")
async def resubmit_file_extractions(
    file_id: str,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    allow: bool = Depends(FileAuthorization("editor")),
):
    """This route will check metadata. We get the extractors run from metadata from extractors.
    Then they are resubmitted. At present parameters are not stored. This will change once Jobs are
    implemented.

        Arguments:
        file_id: Id of file
        credentials: credentials of logged in user
        rabbitmq_client: Rabbitmq Client

    """
    file = await FileDB.get(PydanticObjectId(file_id))
    if file is not None:
        resubmit_success_fail = await _resubmit_file_extractors(
            FileOut(**file.dict()), rabbitmq_client, user, credentials
        )
    return resubmit_success_fail


@router.get("/{file_id}/thumbnail")
async def download_file_thumbnail(
    file_id: str,
    fs: Minio = Depends(dependencies.get_fs),
    allow: bool = Depends(FileAuthorization("viewer")),
):
    # If file exists in MongoDB, download from Minio
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        # TODO investigate what happens with dataset versoning and thumbnail
        if file.thumbnail_id is not None:
            content = fs.get_object(settings.MINIO_BUCKET_NAME, str(file.thumbnail_id))
        else:
            raise HTTPException(
                status_code=404, detail=f"File {file_id} has no associated thumbnail"
            )

        # Get content type & open file stream
        response = StreamingResponse(content.stream(settings.MINIO_UPLOAD_CHUNK_SIZE))
        # TODO: How should filenames be handled for thumbnails?
        response.headers["Content-Disposition"] = "attachment; filename=%s" % "thumb"
        return response
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.patch("/{file_id}/thumbnail/{thumbnail_id}", response_model=FileOut)
async def add_file_thumbnail(
    file_id: str,
    thumbnail_id: str,
    allow: bool = Depends(FileAuthorization("editor")),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        if (await ThumbnailDB.get(PydanticObjectId(thumbnail_id))) is not None:
            # TODO: Should we garbage collect existing thumbnail if nothing else points to it?
            file.thumbnail_id = thumbnail_id
            await file.save()
            await index_thumbnail(
                es, thumbnail_id, str(file.id), str(file.dataset_id), False
            )
            return file.dict()
        else:
            raise HTTPException(
                status_code=404, detail=f"Thumbnail {thumbnail_id} not found"
            )
    raise HTTPException(status_code=404, detail=f"File {file_id} not found")
