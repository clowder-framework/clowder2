from typing import Optional, List

from beanie import PydanticObjectId
from bson import ObjectId
from elasticsearch import Elasticsearch
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    Form,
)

from app import dependencies
from app.config import settings
from app.deps.authorization_deps import FileAuthorization
from app.keycloak_auth import get_current_user, UserOut
from app.models.files import FileOut, FileDB, FileVersionDB
from app.models.listeners import EventListenerDB
from app.models.metadata import (
    MongoDBRef,
    MetadataAgent,
    MetadataDefinitionOut,
    MetadataIn,
    MetadataDB,
    MetadataOut,
    MetadataPatch,
    validate_context,
    patch_metadata,
    MetadataDelete,
    MetadataDefinitionDB,
)
from app.search.connect import delete_document_by_id
from app.search.index import index_file

router = APIRouter()



@router.get("/{file_id}/metadata", response_model=List[MetadataOut])
async def get_file_metadata(
    file_id: str,
    version: Optional[int] = None,
    all_versions: Optional[bool] = False,
    definition: Optional[str] = Form(None),
    listener_name: Optional[str] = Form(None),
    listener_version: Optional[float] = Form(None),
    user=Depends(get_current_user),
    allow: bool = Depends(FileAuthorization("viewer")),
):
    """Get file metadata."""
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        query = [MetadataDB.resource.resource_id == ObjectId(file_id)]

        # Validate specified version, or use latest by default
        if not all_versions:
            if version is not None:
                if (
                    await FileVersionDB.find_one(
                        FileVersionDB.file_id == ObjectId(file_id),
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
            query.append(MetadataDB.resource.version == target_version)

        if definition is not None:
            # TODO: Check if definition exists in database and raise error if not
            query.append(MetadataDB.definition == definition)

        if listener_name is not None:
            query.append(MetadataDB.agent.extractor.name == listener_name)
        if listener_version is not None:
            query.append(MetadataDB.agent.extractor.version == listener_version)

        metadata = []
        async for md in MetadataDB.find(*query):
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