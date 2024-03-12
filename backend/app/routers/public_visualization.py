from datetime import timedelta
from typing import List, Optional

from beanie import PydanticObjectId
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from minio import Minio
from starlette.responses import StreamingResponse

from app import dependencies
from app.config import settings
from app.models.visualization_config import (
    VisualizationConfigOut,
    VisualizationConfigDB,
)
from app.models.visualization_data import (
    VisualizationDataOut,
    VisualizationDataDB,
)

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
        visualization := await VisualizationDataDB.get(
            PydanticObjectId(visualization_id)
        )
    ) is not None:
        content = fs.get_object(settings.MINIO_BUCKET_NAME, visualization_id)

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
        visualization := await VisualizationDataDB.get(
            PydanticObjectId(visualization_id)
        )
    ) is not None:
        if expires_in_seconds is None:
            expires = timedelta(seconds=settings.MINIO_EXPIRES)
        else:
            expires = timedelta(seconds=expires_in_seconds)

        # Generate a signed URL with expiration time
        presigned_url = external_fs.presigned_get_object(
            bucket_name=settings.MINIO_BUCKET_NAME,
            object_name=visualization_id,
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
    query = [VisualizationConfigDB.resource.resource_id == ObjectId(resource_id)]
    visconfigs = []
    async for vzconfig in VisualizationConfigDB.find(*query):
        config_visdata = []
        visdata_query = [VisualizationDataDB.visualization_config_id == vzconfig.id]
        async for vis_data in VisualizationDataDB.find(*visdata_query):
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
        vis_config := await VisualizationConfigDB.get(PydanticObjectId(config_id))
    ) is not None:
        config_visdata = []
        query = [VisualizationDataDB.visualization_config_id == config_id]
        async for vis_data in VisualizationDataDB.find(*query):
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
        vis_config := await VisualizationConfigDB.get(PydanticObjectId(config_id))
    ) is not None:
        query = [VisualizationDataDB.visualization_config_id == config_id]
        async for vis_data in VisualizationDataDB.find(*query):
            config_visdata.append(vis_data)
        return config_visdata
    else:
        raise HTTPException(status_code=404, detail=f"VisConfig {config_id} not found")
