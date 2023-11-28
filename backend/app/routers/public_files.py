import io
import time
from datetime import datetime, timedelta
from typing import Optional, List
from typing import Union

from beanie import PydanticObjectId
from beanie.odm.operators.update.general import Inc
from bson import ObjectId
from elasticsearch import Elasticsearch, NotFoundError
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    Security,
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
    FileDB,
    FileVersionDB,
)
from app.models.datasets import (
    DatasetDB,
    DatasetStatus,
)
from app.models.metadata import MetadataDB
from app.models.users import UserOut
from app.models.thumbnails import ThumbnailDB
from app.rabbitmq.listeners import submit_file_job, EventListenerJobDB
from app.routers.feeds import check_feed_listeners
from app.routers.utils import get_content_type
from app.search.connect import (
    delete_document_by_id,
    insert_record,
    update_record,
)
from app.search.index import index_file, index_thumbnail

router = APIRouter()
security = HTTPBearer()

@router.get("/{file_id}/summary", response_model=FileOut)
async def get_file_summary(
    file_id: str,
):
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        # TODO: Incrementing too often (3x per page view)
        # file.views += 1
        # await file.replace()
        if (dataset := await DatasetDB.get(PydanticObjectId(file.dataset_id))) is not None:
            if dataset.status == DatasetStatus.PUBLIC.name:
                return file.dict()
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")

@router.get("/{file_id}/version_details", response_model=FileOut)
async def get_file_version_details(
    file_id: str,
    version_num: Optional[int] = 0,
):
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        # TODO: Incrementing too often (3x per page view)
        if (dataset := await DatasetDB.get(PydanticObjectId(file.dataset_id))) is not None:
            if dataset.status == DatasetStatus.PUBLIC.name:
                file_vers = await FileVersionDB.find_one(
                    FileVersionDB.file_id == ObjectId(file_id),
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
):
    file = await FileDB.get(PydanticObjectId(file_id))
    if file is not None:
        if (dataset := await DatasetDB.get(PydanticObjectId(file.dataset_id))) is not None:
            if dataset.status == DatasetStatus.PUBLIC.name:
                mongo_versions = []
                async for ver in FileVersionDB.find(
                    FileVersionDB.file_id == ObjectId(file_id)
                ).sort(-FileVersionDB.created).skip(skip).limit(limit):
                    mongo_versions.append(FileVersion(**ver.dict()))
                return mongo_versions
    raise HTTPException(status_code=404, detail=f"File {file_id} not found")

@router.get("/{file_id}")
async def download_file(
    file_id: str,
    version: Optional[int] = None,
    increment: Optional[bool] = True,
    fs: Minio = Depends(dependencies.get_fs),
):
    # If file exists in MongoDB, download from Minio
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        if (dataset := await DatasetDB.get(PydanticObjectId(file.dataset_id))) is not None:
            if dataset.status == DatasetStatus.PUBLIC.name:
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
                if increment:
                    # Increment download count
                    await file.update(Inc({FileDB.downloads: 1}))
                return response
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")

@router.get("/{file_id}/thumbnail")
async def download_file_thumbnail(
    file_id: str,
    fs: Minio = Depends(dependencies.get_fs),
):
    # If file exists in MongoDB, download from Minio
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        if (dataset := await DatasetDB.get(PydanticObjectId(file.dataset_id))) is not None:
            if dataset.status == DatasetStatus.PUBLIC.name:
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