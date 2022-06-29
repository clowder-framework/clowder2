import io
from datetime import datetime
from typing import Optional, List

from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from pymongo import MongoClient

import app.dependencies as deps
from app.keycloak_auth import get_user, get_current_user
from app.models.pyobjectid import PyObjectId
from app.models.metadata import (
    MetadataDefinitionIn,
    MetadataDefinitionDB,
    MetadataDefinitionOut,
    MetadataIn,
    MetadataDB,
    MetadataOut,
    MetadataPatch,
    patch_metadata,
)

router = APIRouter()


@router.post("/definition", response_model=MetadataDefinitionOut)
async def save_metadata_definition(
    definition_in: MetadataDefinitionIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(deps.get_db),
):
    if (
        md_def := await db["metadata.definitions"].find_one(
            {"name": definition_in.name}
        )
    ) is not None:
        raise HTTPException(
            status_code=409,
            detail=f"Metadata definition named {definition_in.name} already exists.",
        )

    md_def = MetadataDefinitionDB(**definition_in.dict(), creator=user)
    new_md_def = await db["metadata.definitions"].insert_one(md_def.to_mongo())
    found = await db["metadata.definitions"].find_one({"_id": new_md_def.inserted_id})
    md_def_out = MetadataDefinitionOut.from_mongo(found)
    return md_def_out


@router.get("/definition", response_model=List[MetadataDefinitionOut])
async def get_metadata_definition(
    name: Optional[str] = None,
    user=Depends(get_current_user),
    db: MongoClient = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 2,
):
    definitions = []
    if name is None:
        root_query = db["metadata.definitions"].find()
    else:
        root_query = db["metadata.definitions"].find({"name": name})

    for doc in await root_query.skip(skip).limit(limit).to_list(length=limit):
        definitions.append(MetadataDefinitionOut.from_mongo(doc))
    return definitions


@router.patch("/{metadata_id}", response_model=MetadataOut)
async def update_metadata(
    metadata_in: MetadataPatch,
    metadata_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(deps.get_db),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """
    if (
        md := await db["metadata"].find_one({"_id": PyObjectId(metadata_id)})
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        contents = metadata_in.contents
        result = await patch_metadata(md, contents, db)
        return result
    else:
        raise HTTPException(
            status_code=404, detail=f"Metadata {metadata_id} not found"
        )


@router.delete("/{metadata_id}")
async def delete_metadata(
    metadata_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(deps.get_db),
):
    """Delete metadata by specific ID."""
    if (
        md := await db["metadata"].find_one({"_id": PyObjectId(metadata_id)})
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        await db["metadata"].delete_one({"_id": PyObjectId(metadata_id)})
        return {"deleted": metadata_id}
    else:
        raise HTTPException(
            status_code=404, detail=f"Metadata {metadata_id} not found"
        )
