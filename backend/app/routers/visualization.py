import mimetypes

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.datastructures import UploadFile
from fastapi.param_functions import File

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


@router.post("/config", response_model=VizConfigOut)
async def save_visualization_config(
    resource_id: str,
    resource_type: str,
    vizconfig_in: VizConfigIn,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    if resource_type == 'file':
        resource_ref = MongoDBRef(
            collection='files', resource_id=resource_id)
        file = await FileDB.get(PydanticObjectId(resource_id))
        if file is not None:
            vizconfig_in = vizconfig_in.dict()
            return VizConfigDB(
                **vizconfig_in,
                resource=resource_ref
            )
        else:
            raise HTTPException(status_code=404, detail=f"File {resource_id} not found")
    elif resource_type == 'dataset':
        resource_ref = MongoDBRef(
            collection='datasets', resource_id=resource_id)
        dataset = await DatasetDB.get(PydanticObjectId(resource_id))
        if dataset is not None:
            vizconfig_in = vizconfig_in.dict()
            return VizConfigDB(
                **vizconfig_in,
                resource=resource_ref
            )
        else:
            raise HTTPException(status_code=404, detail=f"File {resource_id} not found")
