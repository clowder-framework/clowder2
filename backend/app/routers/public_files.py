from typing import List, Optional

from app import dependencies
from app.config import settings
from app.db.file.download import _increment_file_downloads
from app.models.datasets import DatasetDBViewList, DatasetStatus
from app.models.files import FileDBViewList, FileOut, FileVersion, FileVersionDB
from app.models.metadata import (
    MetadataDBViewList,
    MetadataDefinitionDB,
    MetadataDefinitionOut,
    MetadataOut,
)
from beanie import PydanticObjectId
from beanie.odm.operators.find.logical import Or
from bson import ObjectId
from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer
from minio import Minio

router = APIRouter()
security = HTTPBearer()


@router.get("/{file_id}/summary", response_model=FileOut)
async def get_file_summary(
    file_id: str,
):
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        # TODO: Incrementing too often (3x per page view)
        # file.views += 1
        # await file.replace()
        if (
            dataset := await DatasetDBViewList.find_one(
                DatasetDBViewList.id == PydanticObjectId(file.dataset_id)
            )
        ) is not None:
            if dataset.status == DatasetStatus.PUBLIC.name:
                return file.dict()
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/version_details", response_model=FileOut)
async def get_file_version_details(
    file_id: str,
    version_num: Optional[int] = 0,
):
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        # TODO: Incrementing too often (3x per page view)
        if (
            dataset := await DatasetDBViewList.find_one(
                DatasetDBViewList.id == PydanticObjectId(file.dataset_id)
            )
        ) is not None:
            if dataset.status == DatasetStatus.PUBLIC.name:
                file_vers = await FileVersionDB.find_one(
                    Or(
                        FileVersionDB.file_id == PydanticObjectId(file_id),
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
):
    file = await FileDBViewList.find_one(FileDBViewList.id == PydanticObjectId(file_id))
    if file is not None:
        if (
            dataset := await DatasetDBViewList.find_one(
                DatasetDBViewList.id == PydanticObjectId(file.dataset_id)
            )
        ) is not None:
            if dataset.status == DatasetStatus.PUBLIC.name:
                mongo_versions = []
                async for ver in (
                    FileVersionDB.find(
                        FileVersionDB.file_id == PydanticObjectId(file_id)
                    )
                    .sort(-FileVersionDB.created)
                    .skip(skip)
                    .limit(limit)
                ):
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
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        # find the bytes id
        # if it's working draft file_id == origin_id
        # if it's published origin_id points to the raw bytes
        bytes_file_id = str(file.origin_id) if file.origin_id else str(file.id)

        if (
            dataset := await DatasetDBViewList.find_one(
                DatasetDBViewList.id == PydanticObjectId(file.dataset_id)
            )
        ) is not None:
            if dataset.status == DatasetStatus.PUBLIC.name:
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
                if increment:
                    # Increment download count
                    await _increment_file_downloads(file_id)

                return response
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/thumbnail")
async def download_file_thumbnail(
    file_id: str,
    fs: Minio = Depends(dependencies.get_fs),
):
    # If file exists in MongoDB, download from Minio
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        if (
            dataset := await DatasetDBViewList.find_one(
                DatasetDBViewList.id == PydanticObjectId(file.dataset_id)
            )
        ) is not None:
            if dataset.status == DatasetStatus.PUBLIC.name:
                if file.thumbnail_id is not None:
                    content = fs.get_object(
                        settings.MINIO_BUCKET_NAME, str(file.thumbnail_id)
                    )
                else:
                    raise HTTPException(
                        status_code=404,
                        detail=f"File {file_id} has no associated thumbnail",
                    )

                # Get content type & open file stream
                response = StreamingResponse(
                    content.stream(settings.MINIO_UPLOAD_CHUNK_SIZE)
                )
                # TODO: How should filenames be handled for thumbnails?
                response.headers["Content-Disposition"] = (
                    "attachment; filename=%s" % "thumb"
                )
                return response
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/metadata", response_model=List[MetadataOut])
async def get_file_metadata(
    file_id: str,
    version: Optional[int] = None,
    all_versions: Optional[bool] = False,
    definition: Optional[str] = Form(None),
    listener_name: Optional[str] = Form(None),
    listener_version: Optional[float] = Form(None),
):
    """Get file metadata."""
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        if (
            dataset := await DatasetDBViewList.find_one(
                DatasetDBViewList.id == PydanticObjectId(file.dataset_id)
            )
        ) is not None:
            if dataset.status == DatasetStatus.PUBLIC.name:
                query = [
                    MetadataDBViewList.resource.resource_id == PydanticObjectId(file_id)
                ]

                # Validate specified version, or use latest by default
                if not all_versions:
                    if version is not None:
                        if (
                            await FileVersionDB.find_one(
                                Or(
                                    FileVersionDB.file_id == PydanticObjectId(file_id),
                                    FileVersionDB.file_id == file.origin_id,
                                ),
                                FileVersionDB.version_num == version,
                            )
                        ) is None:
                            raise HTTPException(
                                status_code=404,
                                detail=f"File version {version} does not exist",
                            )
                        target_version = version
                    else:
                        target_version = file.version_num
                    query.append(MetadataDBViewList.resource.version == target_version)

                if definition is not None:
                    # TODO: Check if definition exists in database and raise error if not
                    query.append(MetadataDBViewList.definition == definition)

                if listener_name is not None:
                    query.append(
                        MetadataDBViewList.agent.extractor.name == listener_name
                    )
                if listener_version is not None:
                    query.append(
                        MetadataDBViewList.agent.extractor.version == listener_version
                    )

                metadata = []
                async for md in MetadataDBViewList.find(*query):
                    if md.definition is not None:
                        if (
                            md_def := await MetadataDefinitionDB.find_one(
                                MetadataDefinitionDB.name == md.definition
                            )
                        ) is not None:
                            md_def = MetadataDefinitionOut(**md_def.dict())
                            md.description = md_def.description
                    metadata.append(md.dict())
                return metadata
            else:
                raise HTTPException(status_code=404, detail=f"File {file_id} not found")
        else:
            raise HTTPException(status_code=404, detail=f"File {file_id} not found")
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")
