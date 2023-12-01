from typing import List, Optional

from beanie import PydanticObjectId
from beanie.odm.operators.find.evaluation import RegEx
from beanie.odm.operators.find.logical import Or
from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, HTTPException

from app import dependencies
from app.deps.authorization_deps import MetadataAuthorization
from app.keycloak_auth import get_current_user
from app.models.metadata import (
    MetadataDB,
    MetadataDefinitionDB,
    MetadataDefinitionIn,
    MetadataDefinitionOut,
    MetadataOut,
    MetadataPatch,
    patch_metadata,
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
        await md_def.insert()
        return md_def.dict()


@router.get("/definition", response_model=List[MetadataDefinitionOut])
async def get_metadata_definition_list(
    name: Optional[str] = None,
    user=Depends(get_current_user),
    skip: int = 0,
    limit: int = 2,
):
    if name is None:
        defs = await MetadataDefinitionDB.find(
            sort=(-MetadataDefinitionDB.created), skip=skip, limit=limit
        ).to_list()
    else:
        defs = await MetadataDefinitionDB.find(
            MetadataDefinitionDB.name == name,
            sort=(-MetadataDefinitionDB.created),
            skip=skip,
            limit=limit,
        ).to_list()
    return [mddef.dict() for mddef in defs]


@router.get(
    "/definition/{metadata_definition_id}", response_model=MetadataDefinitionOut
)
async def get_metadata_definition(
    metadata_definition_id: str,
    user=Depends(get_current_user),
):
    if (
        mdd := await MetadataDefinitionDB.get(PydanticObjectId(metadata_definition_id))
    ) is not None:
        return mdd.dict()
    raise HTTPException(
        status_code=404,
        detail=f"Metadata definition {metadata_definition_id} not found",
    )


@router.delete(
    "/definition/{metadata_definition_id}", response_model=MetadataDefinitionOut
)
async def delete_metadata_definition(
    metadata_definition_id: str,
    user=Depends(get_current_user),
):
    """Delete metadata definition by specific ID."""
    mdd = await MetadataDefinitionDB.find_one(
        MetadataDefinitionDB.id == PyObjectId(metadata_definition_id)
    )
    if mdd:
        # Check if metadata using this definition exists
        metadata_using_definition = await MetadataDB.find(
            MetadataDB.definition == mdd.name
        ).to_list()

        if len(metadata_using_definition) > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Metadata definition: {mdd.name} ({metadata_definition_id}) in use. "
                f"You cannot delete it until all metadata records using it are deleted.",
            )

        # TODO: Refactor this with permissions checks etc.
        await mdd.delete()
        return mdd.dict()
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Metadata definition {metadata_definition_id} not found",
        )


@router.get(
    "/definition/search/{search_term}", response_model=List[MetadataDefinitionOut]
)
async def search_metadata_definition(
    search_term: str,
    skip: int = 0,
    limit: int = 10,
    user=Depends(get_current_user),
):
    """Search all metadata definition in the db based on text.

    Arguments:
        text -- any text matching name or description
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
    """

    mdds = await MetadataDefinitionDB.find(
        Or(
            RegEx(field=MetadataDefinitionDB.name, pattern=search_term),
            RegEx(field=MetadataDefinitionDB.description, pattern=search_term),
            RegEx(field=MetadataDefinitionDB.context, pattern=search_term),
        ),
        sort=(-MetadataDefinitionDB.created),
        skip=skip,
        limit=limit,
    ).to_list()

    return [mdd.dict() for mdd in mdds]


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
