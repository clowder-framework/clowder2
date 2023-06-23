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

from app.models.viz_config import VizConfigOut, VizConfigDB, VizConfigIn
from app.models.metadata import MongoDBRef

router = APIRouter()
security = HTTPBearer()


@router.post("/config", response_model=VizConfigOut)
async def save_visualization_config(
    vizconfig_in: VizConfigIn,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    vizconfig_in = vizconfig_in.dict()
    resource_id = vizconfig_in["resource_id"]
    if vizconfig_in["resource_type"] == "file":
        file = await FileDB.get(PydanticObjectId(resource_id))
        if file is not None:
            resource_ref = MongoDBRef(
                collection="files", resource_id=vizconfig_in["resource_id"]
            )
            viz_config = VizConfigDB(**vizconfig_in, resource=resource_ref)
            await viz_config.insert()
            return viz_config.dict()
        else:
            raise HTTPException(status_code=404, detail=f"File {resource_id} not found")
    elif vizconfig_in["resource_type"] == "dataset":
        dataset = await DatasetDB.get(PydanticObjectId(resource_id))
        if dataset is not None:
            resource_ref = MongoDBRef(
                collection="datasets", resource_id=vizconfig_in["resource_id"]
            )
            viz_config = VizConfigDB(**vizconfig_in, resource=resource_ref)
            await viz_config.insert()
            return viz_config.dict()
        else:
            raise HTTPException(
                status_code=404, detail=f"Dataset {resource_id} not found"
            )


@router.get("/{file_id}/config_file", response_model=List[VizConfigOut])
async def get_resource_vizconfig(
    file_id: PydanticObjectId,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        query = [VizConfigDB.resource.resource_id == ObjectId(file_id)]
        vizconfigs = []
        async for vzconfig in VizConfigDB.find(*query):
            vizconfigs.append(vzconfig)
        return [vz.dict() for vz in vizconfigs]
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{dataset_id}/config_dataset", response_model=List[VizConfigOut])
async def get_resource_vizconfig(
    dataset_id: PydanticObjectId,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        query = [VizConfigDB.resource.resource_id == ObjectId(dataset_id)]
        vizconfigs = []
        async for vzconfig in VizConfigDB.find(*query):
            vizconfigs.append(vzconfig)
        return [vz.dict() for vz in vizconfigs]
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/config/{config_id}", response_model=VizConfigOut)
async def get_vizconfig(
    config_id: PydanticObjectId,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    if (viz_config := await VizConfigDB.get(PydanticObjectId(config_id))) is not None:
        return viz_config.dict()
    else:
        raise HTTPException(status_code=404, detail=f"VizConfig {config_id} not found")


@router.patch("/config/{config_id}/vizdata", response_model=VizConfigOut)
async def update_vizconfig_map(
    config_id: PydanticObjectId,
    new_viz_config_data: dict,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    if (viz_config := await VizConfigDB.get(PydanticObjectId(config_id))) is not None:
        viz_config.viz_config_data = new_viz_config_data
        await viz_config.replace()
        return viz_config.dict()
    else:
        raise HTTPException(status_code=404, detail=f"VizConfig {config_id} not found")


@router.delete("/config/{config_id}", response_model=VizConfigOut)
async def delete_vizconfig(
    config_id: PydanticObjectId,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    if (viz_config := await VizConfigDB.get(PydanticObjectId(config_id))) is not None:
        await viz_config.delete()
        return viz_config.dict()
    else:
        raise HTTPException(status_code=404, detail=f"VizConfig {config_id} not found")
