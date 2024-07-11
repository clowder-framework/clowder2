from typing import Optional

from app import dependencies
from app.config import settings
from app.models.thumbnails import ThumbnailDB, ThumbnailDBViewList
from beanie import PydanticObjectId
from beanie.odm.operators.update.general import Inc
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from minio import Minio
from starlette.responses import StreamingResponse

router = APIRouter()
security = HTTPBearer()


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
