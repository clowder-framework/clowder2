from typing import List

from beanie import PydanticObjectId
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from fastapi import File, UploadFile
from fastapi.security import HTTPBearer
from minio import Minio
from starlette.responses import StreamingResponse

from app import dependencies
from app.config import settings
from app.keycloak_auth import get_current_user
from app.models.datasets import DatasetDB
from app.models.files import FileDB
from app.models.metadata import MongoDBRef
from app.models.visualization_config import (
    VisualizationConfigOut,
    VisualizationConfigDB,
    VisualizationConfigIn,
)
from app.models.visualization_data import (
    VisualizationDataOut,
    VisualizationDataIn,
    VisualizationDataDB,
)
from app.routers.utils import get_content_type

router = APIRouter()
security = HTTPBearer()


@router.post("", response_model=VisualizationDataOut)
async def add_Visualization(
    name: str,
    description: str,
    config: str,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
):
    """Insert VisualizationsDataDB object into MongoDB (makes Clowder ID), then Minio.

    Arguments:
        name: name of visualization data
        description: description of visualization data
        file: bytes to upload
    """
    visualization_in = VisualizationDataIn(name=name, description=description)

    # Check all connection and abort if any one of them is not available
    if fs is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    visualization_db = VisualizationDataDB(
        **visualization_in.dict(),
        visualization_config_id=PydanticObjectId(config),
        creator=user,
    )

    await visualization_db.insert()
    visualization_db.content_type = get_content_type(file.filename, file.content_type)
    visualization_id = visualization_db.id

    # Use unique ID as key for Minio
    response = fs.put_object(
        settings.MINIO_BUCKET_NAME,
        str(visualization_id),
        file.file,
        length=-1,
        part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
        content_type=visualization_db.content_type.content_type,
    )  # async write chunk to minio
    visualization_db.bytes = len(
        fs.get_object(settings.MINIO_BUCKET_NAME, str(visualization_id)).data
    )
    await visualization_db.replace()

    return visualization_db.dict()


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


@router.delete("/{visualization_id}")
async def remove_visualization(
    visualization_id: str, fs: Minio = Depends(dependencies.get_fs)
):
    if (
        visualization := await VisualizationDataDB.get(
            PydanticObjectId(visualization_id)
        )
    ) is not None:
        visualization_config_id = visualization.visualization_config_id
        if (
            vis_config := await VisualizationConfigDB.get(visualization_config_id)
        ) is not None:
            vis_config.delete()
        fs.remove_object(settings.MINIO_BUCKET_NAME, visualization_id)
        visualization.delete()
        return
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


@router.post("/config", response_model=VisualizationConfigOut)
async def save_visualization_config(
    visconfig_in: VisualizationConfigIn,
    user=Depends(get_current_user),
):
    visconfig_in = visconfig_in.dict()
    # TODO why does it not have right type in the db without the lines below?
    resource_id = visconfig_in["resource"]["resource_id"]
    collection = visconfig_in["resource"]["collection"]
    resource_ref = MongoDBRef(collection=collection, resource_id=resource_id)
    del visconfig_in["resource"]
    if collection == "files":
        file = await FileDB.get(PydanticObjectId(resource_id))
        if file is not None:
            vis_config = VisualizationConfigDB(**visconfig_in, resource=resource_ref)
            await vis_config.insert()
            return vis_config.dict()
        else:
            raise HTTPException(status_code=404, detail=f"File {resource_id} not found")
    elif collection == "datasets":
        dataset = await DatasetDB.get(PydanticObjectId(resource_id))
        if dataset is not None:
            vis_config = VisualizationConfigDB(**visconfig_in, resource=resource_ref)
            await vis_config.insert()
            return vis_config.dict()
        else:
            raise HTTPException(
                status_code=404, detail=f"Dataset {resource_id} not found"
            )


@router.get("/{resource_id}/config", response_model=List[VisualizationConfigOut])
async def get_resource_visconfig(
    resource_id: PydanticObjectId,
    user=Depends(get_current_user),
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
        visconfigs.append(visconfig_out)
    return [vz.dict() for vz in visconfigs]


@router.get("/config/{config_id}", response_model=VisualizationConfigOut)
async def get_visconfig(
    config_id: PydanticObjectId,
    user=Depends(get_current_user),
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
    user=Depends(get_current_user),
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


@router.delete("/config/{config_id}", response_model=VisualizationConfigOut)
async def delete_visconfig(
    config_id: PydanticObjectId,
    user=Depends(get_current_user),
):
    if (
        vis_config := await VisualizationConfigDB.get(PydanticObjectId(config_id))
    ) is not None:
        query = [VisualizationDataDB.visualization_config_id == config_id]
        async for vis_data in VisualizationDataDB.find(*query):
            await vis_data.delete()
        await vis_config.delete()
        return vis_config.dict()
    else:
        raise HTTPException(status_code=404, detail=f"VisConfig {config_id} not found")
