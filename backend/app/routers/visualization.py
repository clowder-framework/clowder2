import mimetypes

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends, Security, Request
from fastapi.datastructures import UploadFile
from fastapi.param_functions import File
from bson import ObjectId
from minio import Minio
from typing import Optional, List
from app import dependencies
from app.config import settings
from app.keycloak_auth import get_current_user
from app.models.files import FileContentType, FileDB
from app.models.datasets import DatasetDB
from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.deps.authorization_deps import FileAuthorization

from app.models.visualization_config import (
    VisualizationConfigOut,
    VisualizationConfigDB,
    VisualizationConfigIn,
)
from app.models.metadata import MongoDBRef

router = APIRouter()
security = HTTPBearer()


@router.post("/config", response_model=VisualizationConfigOut)
async def save_visualization_config(
    vizconfig_in: VisualizationConfigIn,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    vizconfig_in = vizconfig_in.dict()
    # TODO why does it not have right type in the db without the lines below?
    resource_id = vizconfig_in["resource"]["resource_id"]
    collection = vizconfig_in["resource"]["collection"]
    resource_ref = MongoDBRef(collection=collection, resource_id=resource_id)
    del vizconfig_in["resource"]
    if collection == "files":
        file = await FileDB.get(PydanticObjectId(resource_id))
        if file is not None:
            viz_config = VisualizationConfigDB(**vizconfig_in, resource=resource_ref)
            await viz_config.insert()
            return viz_config.dict()
        else:
            raise HTTPException(status_code=404, detail=f"File {resource_id} not found")
    elif collection == "datasets":
        dataset = await DatasetDB.get(PydanticObjectId(resource_id))
        if dataset is not None:
            viz_config = VisualizationConfigDB(**vizconfig_in, resource=resource_ref)
            await viz_config.insert()
            return viz_config.dict()
        else:
            raise HTTPException(
                status_code=404, detail=f"Dataset {resource_id} not found"
            )


@router.get("/{file_id}/config", response_model=List[VisualizationConfigOut])
async def get_resource_vizconfig(
    file_id: PydanticObjectId,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    query = [VisualizationConfigDB.resource.resource_id == ObjectId(file_id)]
    vizconfigs = []
    async for vzconfig in VisualizationConfigDB.find(*query):
        vizconfigs.append(vzconfig)
    return [vz.dict() for vz in vizconfigs]


@router.get("/config/{config_id}", response_model=VisualizationConfigOut)
async def get_vizconfig(
    config_id: PydanticObjectId,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    if (
        viz_config := await VisualizationConfigDB.get(PydanticObjectId(config_id))
    ) is not None:
        return viz_config.dict()
    else:
        raise HTTPException(status_code=404, detail=f"VizConfig {config_id} not found")


@router.patch("/config/{config_id}/vizdata", response_model=VisualizationConfigOut)
async def update_vizconfig_map(
    config_id: PydanticObjectId,
    new_viz_config_data: dict,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    if (
        viz_config := await VisualizationConfigDB.get(PydanticObjectId(config_id))
    ) is not None:
        viz_config.viz_config_data = new_viz_config_data
        await viz_config.replace()
        return viz_config.dict()
    else:
        raise HTTPException(status_code=404, detail=f"VizConfig {config_id} not found")


@router.delete("/config/{config_id}", response_model=VisualizationConfigOut)
async def delete_vizconfig(
    config_id: PydanticObjectId,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    if (
        viz_config := await VisualizationConfigDB.get(PydanticObjectId(config_id))
    ) is not None:
        await viz_config.delete()
        return viz_config.dict()
    else:
        raise HTTPException(status_code=404, detail=f"VizConfig {config_id} not found")
