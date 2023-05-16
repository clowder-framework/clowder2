import io
import mimetypes
from datetime import datetime
from typing import Optional, List
from typing import Union

from beanie import PydanticObjectId
from beanie.odm.operators.update.general import Inc
from bson import ObjectId
from elasticsearch import Elasticsearch
from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi import (
    File,
    UploadFile,
)
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from minio import Minio
from pika.adapters.blocking_connection import BlockingChannel

from app import dependencies
from app.config import settings
from app.deps.authorization_deps import FileAuthorization
from app.keycloak_auth import get_current_user, get_token
from app.models.files import (
    FileOut,
    FileVersion,
    FileContentType,
    FileDB,
    FileVersionDB,
)
from app.models.metadata import MetadataDB
from app.models.users import UserOut
from app.rabbitmq.listeners import submit_file_job, EventListenerJobDB
from app.routers.feeds import check_feed_listeners
from app.search.connect import (
    insert_record,
    delete_document_by_id,
    update_record,
    delete_document_by_query,
)

router = APIRouter()
security = HTTPBearer()


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
    jobs = EventListenerJobDB.find(
        EventListenerJobDB.resource_ref.resource_id == ObjectId(file.id),
        EventListenerJobDB.resource_ref.version == file.version_num - 1,
    )
    async for job in jobs:
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
        except Exception as e:
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
    if fs is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    await new_file.insert()
    new_file_id = new_file.id
    if content_type is None:
        content_type = mimetypes.guess_type(new_file.name)
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
    doc = {
        "name": new_file.name,
        "creator": new_file.creator.email,
        "created": new_file.created,
        "download": new_file.downloads,
        "dataset_id": str(new_file.dataset_id),
        "folder_id": str(new_file.folder_id),
        "bytes": new_file.bytes,
        "content_type": content_type_obj.content_type,
        "content_type_main": content_type_obj.main_type,
    }
    insert_record(es, "file", doc, new_file.id)

    # Submit file job to any qualifying feeds
    await check_feed_listeners(
        es, FileOut(**new_file.dict()), user, rabbitmq_client, token
    )


# TODO: Move this to MongoDB middle layer
async def remove_file_entry(
    file_id: Union[str, ObjectId], fs: Minio, es: Elasticsearch
):
    """Remove FileDB object into MongoDB, Minio, and associated metadata and version information."""
    # TODO: Deleting individual versions will require updating version_id in mongo, or deleting entire document

    # Check all connection and abort if any one of them is not available
    if fs is None or es is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return
    fs.remove_object(settings.MINIO_BUCKET_NAME, str(file_id))
    # delete from elasticsearch
    delete_document_by_id(es, "file", str(file_id))
    query = {"match": {"resource_id": str(file_id)}}
    delete_document_by_query(es, "metadata", query)
    await FileDB.get(PydanticObjectId(file_id)).delete()
    await MetadataDB.find(MetadataDB.resource.resource_id == ObjectId(file_id)).delete()
    await FileVersionDB.find(FileVersionDB.file_id == ObjectId(file_id)).delete()


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
            updated_file, rabbitmq_client, user, credentials
        )

        # updating metadata in elasticsearch
        metadata = await MetadataDB.find_one(
            MetadataDB.resource.resource_id == ObjectId(updated_file.id)
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
            update_record(es, "metadata", doc, str(metadata.id))
        return updated_file.dict()
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}")
async def download_file(
    file_id: str,
    version: Optional[int] = None,
    fs: Minio = Depends(dependencies.get_fs),
    allow: bool = Depends(FileAuthorization("viewer")),
):
    # If file exists in MongoDB, download from Minio
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        if version is not None:
            # Version is specified, so get the minio ID from versions table if possible
            file_vers = await FileVersionDB.find_one(
                FileVersionDB.file_id == ObjectId(file_id),
                FileVersionDB.version_num == version,
            )
            if file_vers is not None:
                vers = FileVersion(**file_vers.dict())
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
        response.headers["Content-Disposition"] = "attachment; filename=%s" % file.name
        # Increment download count
        await file.update(Inc({FileDB.downloads, 1}))
        return response
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(FileAuthorization("editor")),
):
    if (await FileDB.get(PydanticObjectId(file_id))) is not None:
        await remove_file_entry(file_id, fs, es)
        return {"deleted": file_id}
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/summary", response_model=FileOut)
async def get_file_summary(
    file_id: str,
    allow: bool = Depends(FileAuthorization("viewer")),
):
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        # TODO: Incrementing too often (3x per page view)
        # file.views += 1
        # await file.replace()
        return file.dict()
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/versions", response_model=List[FileVersion])
async def get_file_versions(
    file_id: str,
    skip: int = 0,
    limit: int = 20,
    allow: bool = Depends(FileAuthorization("viewer")),
):
    file = await FileDB.get(PydanticObjectId(file_id))
    if file is not None:
        mongo_versions = []
        for ver in (
            await FileVersionDB.find(FileVersionDB.file_id == ObjectId(file_id))
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            mongo_versions.append(FileVersion(**ver.dict()))
        return mongo_versions

    raise HTTPException(status_code=404, detail=f"File {file_id} not found")


# submits file to extractor
@router.post("/{file_id}/extract")
async def get_file_extract(
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
        raise HTTPException(status_code=400, detail=f"No extractorName specified")
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        access_token = credentials.credentials

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
            access_token,
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
