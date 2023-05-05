from typing import Optional, List

from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from pymongo import MongoClient

from app import dependencies
from app.deps.authorization_deps import MetadataAuthorization
from app.keycloak_auth import get_current_user
from app.models.metadata import (
    MetadataDefinitionIn,
    MetadataDefinitionDB,
    MetadataDefinitionOut,
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
    db: MongoClient = Depends(dependencies.get_db),
):
    if (
        md_def := await MetadataDefinitionDB.find_one(
            MetadataDefinitionDB.name == definition_in.name
        )
    ) is not None:
        raise HTTPException(
            status_code=409,
            detail=f"Metadata definition named {definition_in.name} already exists.",
        )

    new_md_def = await MetadataDefinitionDB(
        **definition_in.dict(), creator=user
    ).insert()
    found = await MetadataDefinitionDB.find_one(
        MetadataDefinitionDB.id == new_md_def.inserted_id
    )
    md_def_out = MetadataDefinitionOut.from_mongo(found)
    return md_def_out


@router.get("/definition", response_model=List[MetadataDefinitionOut])
async def get_metadata_definition(
    name: Optional[str] = None,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 2,
):
    definitions = []
    if name is None:
        root_query = MetadataDefinitionDB.find_all()
    else:
        root_query = await MetadataDefinitionDB.find_one(
            MetadataDefinitionDB.name == name
        )

    for doc in await root_query.skip(skip).limit(limit).to_list(length=limit):
        definitions.append(MetadataDefinitionOut.from_mongo(doc))
    return definitions


@router.patch("/{metadata_id}", response_model=MetadataOut)
async def update_metadata(
    metadata_in: MetadataPatch,
    metadata_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(MetadataAuthorization("editor")),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """
    if (
        md := await MetadataDB.find_one(MetadataDB.id == PyObjectId(metadata_id))
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        contents = metadata_in.contents
        result = await patch_metadata(md, contents, db)
        return result
    else:
        raise HTTPException(status_code=404, detail=f"Metadata {metadata_id} not found")


@router.delete("/{metadata_id}")
async def delete_metadata(
    metadata_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(MetadataAuthorization("editor")),
):
    """Delete metadata by specific ID."""
    if (
        md := await MetadataDB.find_one(MetadataDB.id == PyObjectId(metadata_id))
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        await db["metadata"].delete_one({"_id": PyObjectId(metadata_id)})
        await MetadataDB(id=PyObjectId(metadata_id)).delete()
        return {"deleted": metadata_id}
    else:
        raise HTTPException(status_code=404, detail=f"Metadata {metadata_id} not found")
