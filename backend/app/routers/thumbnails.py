from typing import Optional

from app import dependencies
from app.config import settings
from app.keycloak_auth import get_current_user
from app.models.datasets import DatasetDB
from app.models.files import FileDB
from app.models.thumbnails import (
    ThumbnailDB,
    ThumbnailDBViewList,
    ThumbnailFreezeDB,
    ThumbnailIn,
    ThumbnailOut,
)
from app.routers.utils import get_content_type
from beanie import PydanticObjectId
from beanie.odm.operators.update.general import Inc
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.security import HTTPBearer
from minio import Minio
from starlette.responses import StreamingResponse

router = APIRouter()
security = HTTPBearer()


@router.post("", response_model=ThumbnailOut)
async def add_thumbnail(
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
):
    """Insert Thumbnail object into MongoDB (makes Clowder ID), then Minio"""
    thumb_in = ThumbnailIn()
    thumb_db = ThumbnailDB(
        **thumb_in.dict(),
        creator=user,
    )
    await thumb_db.insert()
    thumb_db.content_type = get_content_type(file.filename, file.content_type)

    # Use unique ID as key for Minio
    fs.put_object(
        settings.MINIO_BUCKET_NAME,
        str(thumb_db.id),
        file.file,
        length=-1,
        part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
        content_type=thumb_db.content_type.content_type,
    )  # async write chunk to minio
    thumb_db.bytes = len(
        fs.get_object(settings.MINIO_BUCKET_NAME, str(thumb_db.id)).data
    )
    await thumb_db.replace()
    return thumb_db.dict()


@router.delete("/{thumbnail_id}")
async def remove_thumbnail(thumb_id: str, fs: Minio = Depends(dependencies.get_fs)):
    if (thumbnail := await ThumbnailDB.get(PydanticObjectId(thumb_id))) is not None:
        # Delete from associated resources
        async for file in FileDB.find(
            FileDB.thumbnail_id == PydanticObjectId(thumb_id)
        ):
            file.thumbnail_id = None
            file.save()
        async for dataset in DatasetDB.find(
            DatasetDB.thumbnail_id == PydanticObjectId(thumb_id)
        ):
            dataset.thumbnail_id = None
            dataset.save()

        # if not being used in any version, remove the raw bytes
        if (
            await ThumbnailFreezeDB.find_one(
                ThumbnailFreezeDB.origin_id == PydanticObjectId(thumb_id)
            )
        ) is None:
            fs.remove_object(settings.MINIO_BUCKET_NAME, thumb_id)

        await thumbnail.delete()
        return {"deleted": thumb_id}
    raise HTTPException(status_code=404, detail=f"Thumbnail {thumb_id} not found")


@router.get("/{thumbnail_id}")
async def download_thumbnail(
    thumbnail_id: str,
    fs: Minio = Depends(dependencies.get_fs),
    increment: Optional[bool] = False,
):
    # If thumbnail exists in MongoDB, download from Minio
    if (
        thumbnail := await ThumbnailDBViewList.find_one(
            ThumbnailDBViewList.id == PydanticObjectId(thumbnail_id)
        )
    ) is not None:
        bytes_thumbnail_id = (
            str(thumbnail.origin_id) if thumbnail.origin_id else str(thumbnail.id)
        )
        content = fs.get_object(settings.MINIO_BUCKET_NAME, bytes_thumbnail_id)

        # Get content type & open file stream
        response = StreamingResponse(content.stream(settings.MINIO_UPLOAD_CHUNK_SIZE))
        response.headers["Content-Disposition"] = "attachment; filename=%s" % "thumb"
        if increment:
            # Increment download count
            await thumbnail.update(Inc({ThumbnailDB.downloads: 1}))
        return response
    else:
        raise HTTPException(
            status_code=404, detail=f"Visualization {thumbnail_id} not found"
        )
