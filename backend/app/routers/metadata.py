from typing import Optional, List

from elasticsearch import Elasticsearch
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)

from app import dependencies
from app.deps.authorization_deps import MetadataAuthorization
from app.keycloak_auth import get_current_user
from app.models.metadata import (
    MetadataDefinitionIn,
    MetadataDefinitionDB,
    MetadataDefinitionOut,
    MetadataDB,
    MetadataOut,
    MetadataPatch,
    patch_metadata,
    MetadataDB,
)
from app.models.pyobjectid import PyObjectId

router = APIRouter()


@router.post("/definition", response_model=MetadataDefinitionOut)
async def save_metadata_definition(
    definition_in: MetadataDefinitionIn,
    user=Depends(get_current_user),
):
    existing = await MetadataDefinitionDB.find_one(
        MetadataDefinitionDB.name == definition_in.name
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Metadata definition named {definition_in.name} already exists.",
        )
    else:
        md_def = MetadataDefinitionDB(**definition_in.dict(), creator=user)
        await md_def.save()
        return MetadataDefinitionOut(**md_def.dict())


@router.get("/definition", response_model=List[MetadataDefinitionOut])
async def get_metadata_definition(
    name: Optional[str] = None,
    user=Depends(get_current_user),
    skip: int = 0,
    limit: int = 2,
):
    if name is None:
        return (
            await MetadataDefinitionDB.find()
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        )
    else:
        return (
            await MetadataDefinitionDB.find(MetadataDefinitionDB.name == name)
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        )


@router.patch("/{metadata_id}", response_model=MetadataOut)
async def update_metadata(
    metadata_in: MetadataPatch,
    metadata_id: str,
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    user=Depends(get_current_user),
    allow: bool = Depends(MetadataAuthorization("editor")),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """
    md = await MetadataDB.find_one(MetadataDB.id == PyObjectId(metadata_id))
    if md:
        # TODO: Refactor this with permissions checks etc.
        return await patch_metadata(md, metadata_in.contents, es)
    else:
        raise HTTPException(status_code=404, detail=f"Metadata {metadata_id} not found")


@router.delete("/{metadata_id}")
async def delete_metadata(
    metadata_id: str,
    user=Depends(get_current_user),
    allow: bool = Depends(MetadataAuthorization("editor")),
):
    """Delete metadata by specific ID."""
    md = await MetadataDB.find_one(MetadataDB.id == PyObjectId(metadata_id))
    if md:
        # TODO: Refactor this with permissions checks etc.
        await md.delete()
        return {"deleted": metadata_id}
    else:
        raise HTTPException(status_code=404, detail=f"Metadata {metadata_id} not found")
