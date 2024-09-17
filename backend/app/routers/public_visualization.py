from datetime import timedelta
from typing import List, Optional

from app import dependencies
from app.config import settings
from app.models.visualization_config import (
    VisualizationConfigDBViewList,
    VisualizationConfigOut,
)
from app.models.visualization_data import (
    VisualizationDataDB,
    VisualizationDataDBViewList,
    VisualizationDataOut,
)
from beanie import PydanticObjectId
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from minio import Minio
from starlette.responses import StreamingResponse

router = APIRouter()
security = HTTPBearer()


@router.get("/{visualization_id}", response_model=VisualizationDataOut)
async def get_visualization(visualization_id: str):
    if (
        visualization := await VisualizationDataDB.get(
            PydanticObjectId(visualization_id)
        )
    ) is not None:
        return visualization.dict()
    raise HTTPException(
        status_code=404, detail=f"Visualization {visualization_id} not found"
    )


@router.get("/{visualization_id}/bytes")
async def download_visualization(
    visualization_id: str, fs: Minio = Depends(dependencies.get_fs)
):
    # If visualization exists in MongoDB, download from Minio
    if (
        visualization := await VisualizationDataDBViewList.find_one(
            VisualizationDataDBViewList.id == PydanticObjectId(visualization_id)
        )
    ) is not None:
        bytes_visualization_id = (
            str(visualization.origin_id)
            if visualization.origin_id
            else str(visualization.id)
        )
        content = fs.get_object(settings.MINIO_BUCKET_NAME, bytes_visualization_id)

        # Get content type & open file stream
        response = StreamingResponse(content.stream(settings.MINIO_UPLOAD_CHUNK_SIZE))
        response.headers["Content-Disposition"] = (
            "attachment; filename=%s" % visualization.name
        )
        return response
    else:
        raise HTTPException(
            status_code=404, detail=f"Visualization {visualization_id} not found"
        )


@router.get("/{visualization_id}/url/")
async def download_visualization_url(
    visualization_id: str,
    expires_in_seconds: Optional[int] = 3600,
    external_fs: Minio = Depends(dependencies.get_external_fs),
):
    # If visualization exists in MongoDB, download from Minio
    if (
        visualization := await VisualizationDataDBViewList.find_one(
            VisualizationDataDBViewList.id == PydanticObjectId(visualization_id)
        )
    ) is not None:
        bytes_visualization_id = (
            str(visualization.origin_id)
            if visualization.origin_id
            else str(visualization.id)
        )
        if expires_in_seconds is None:
            expires = timedelta(seconds=settings.MINIO_EXPIRES)
        else:
            expires = timedelta(seconds=expires_in_seconds)

        # Generate a signed URL with expiration time
        presigned_url = external_fs.presigned_get_object(
            bucket_name=settings.MINIO_BUCKET_NAME,
            object_name=bytes_visualization_id,
            expires=expires,
        )

        return {"presigned_url": presigned_url}
    else:
        raise HTTPException(
            status_code=404, detail=f"Visualization {visualization_id} not found"
        )


@router.get("/{resource_id}/config", response_model=List[VisualizationConfigOut])
async def get_resource_visconfig(
    resource_id: PydanticObjectId,
):
    query = [
        VisualizationConfigDBViewList.resource.resource_id
        == PydanticObjectId(resource_id)
    ]
    visconfigs = []
    async for vzconfig in VisualizationConfigDBViewList.find(*query):
        config_visdata = []
        visdata_query = [
            VisualizationDataDBViewList.visualization_config_id == vzconfig.id
        ]
        async for vis_data in VisualizationDataDBViewList.find(*visdata_query):
            config_visdata.append(vis_data.dict())
        visconfig_out = VisualizationConfigOut(**vzconfig.dict())
        visconfig_out.visualization_data = config_visdata
        if visconfig_out is not None:
            visconfigs.append(visconfig_out)
    return [vz.dict() for vz in visconfigs]


@router.get("/config/{config_id}", response_model=VisualizationConfigOut)
async def get_visconfig(
    config_id: PydanticObjectId,
):
    if (
        vis_config := await VisualizationConfigDBViewList.find_one(
            VisualizationConfigDBViewList.id == PydanticObjectId(config_id)
        )
    ) is not None:
        config_visdata = []
        query = [VisualizationDataDBViewList.visualization_config_id == config_id]
        async for vis_data in VisualizationDataDBViewList.find(*query):
            config_visdata.append(vis_data.dict())
        # TODO
        vis_config_out = VisualizationConfigOut(**vis_config.dict())
        vis_config_out.visualization_data = config_visdata
        return vis_config_out
    else:
        raise HTTPException(status_code=404, detail=f"VisConfig {config_id} not found")


@router.get("/config/{config_id}/visdata", response_model=List[VisualizationDataOut])
async def get_visdata_from_visconfig(
    config_id: PydanticObjectId,
):
    config_visdata = []
    if (
        await VisualizationConfigDBViewList.find_one(
            VisualizationConfigDBViewList.id == PydanticObjectId(config_id)
        )
    ) is not None:
        query = [VisualizationDataDBViewList.visualization_config_id == config_id]
        async for vis_data in VisualizationDataDBViewList.find(*query):
            config_visdata.append(vis_data)
        return config_visdata
    else:
        raise HTTPException(status_code=404, detail=f"VisConfig {config_id} not found")
