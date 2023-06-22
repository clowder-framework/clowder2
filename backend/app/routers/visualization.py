import mimetypes

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends, Security, Request
from fastapi.datastructures import UploadFile
from fastapi.param_functions import File
from bson import ObjectId
from minio import Minio

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


@router.post("/test")
async def test_visualization_config(
    request: Request,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    as_json = await request.json()
    return {"status":"OK"}


@router.post("/config", response_model=VizConfigOut)
async def save_visualization_config(
    vizconfig_in: VizConfigIn,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    vizconfig_in = vizconfig_in.dict()
    resource_id = vizconfig_in['resource_id']
    if vizconfig_in['resource_type'] == 'file':
        file = await FileDB.get(PydanticObjectId(resource_id))
        if file is not None:
            resource_ref = MongoDBRef(
                collection='files', resource_id=vizconfig_in['resource_id'])
            return VizConfigDB(
                **vizconfig_in,
                resource=resource_ref
            )
        else:
            raise HTTPException(status_code=404, detail=f"File {resource_id} not found")
    elif vizconfig_in['resource_type'] == 'dataset':
        dataset = await DatasetDB.get(PydanticObjectId(resource_id))
        if dataset is not None:
            resource_ref = MongoDBRef(
                collection='datasets', resource_id=vizconfig_in['resource_id'])
            return VizConfigDB(
                **vizconfig_in,
                resource=resource_ref
            )
        else:
            raise HTTPException(status_code=404, detail=f"Dataset {resource_id} not found")

@router.post("/{resource_id}/config", response_model=VizConfigOut)
async def get_vizconfig(
        resource_id: PydanticObjectId,
        resource_type: str,
        user=Depends(get_current_user),
        credentials: HTTPAuthorizationCredentials = Security(security),
):
    if resource_type == 'file':
        if (file := await FileDB.get(PydanticObjectId(resource_id))) is not None:
            query = [VizConfigDB.resource.resource_id == ObjectId(resource_id)]
            vizconfigs = []
            async for vzconfig in VizConfigDB.find(*query):
                vizconfigs.append(vzconfig)
            return [vz.dict() for vz in vizconfigs]
        else:
            raise HTTPException(status_code=404, detail=f"File {resource_id} not found")
    elif resource_type == 'dataset':
        if (dataset := await DatasetDB.get(PydanticObjectId(resource_id))) is not None:
            query = [VizConfigDB.resource.resource_id == ObjectId(resource_id)]
            query = [VizConfigDB.resource.resource_id == ObjectId(resource_id)]
            vizconfigs = []
            async for vzconfig in VizConfigDB.find(*query):
                vizconfigs.append(vzconfig)
            return [vz.dict() for vz in vizconfigs]
        else:
            raise HTTPException(status_code=404, detail=f"Dataset {resource_id} not found")
    return {'status': 'OK'}