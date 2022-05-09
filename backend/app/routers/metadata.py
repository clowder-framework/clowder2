import io
from datetime import datetime
from typing import Optional, List

from bson import ObjectId
from bson.dbref import DBRef
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from minio import Minio
from pydantic import Json
from pymongo import MongoClient

from app import dependencies
from app.keycloak_auth import get_user, get_current_user
from app.config import settings
from app.models.files import FileIn, FileOut, FileVersion
from app.models.users import UserOut
from app.models.metadata import MetadataDefinitionIn, MetadataDefinitionDB, MetadataDefinitionOut, \
    MetadataIn, MetadataDB, MetadataOut

router = APIRouter()


@router.post("/definition", response_model=MetadataDefinitionOut)
async def save_definition(
    definition_in: MetadataDefinitionIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    md_def = MetadataDefinitionDB(**definition_in.dict(), creator=user)
    new_md_def = await db["metadata.definitions"].insert_one(md_def.to_mongo())
    found = await db["metadata.definitions"].find_one({"_id": new_md_def.inserted_id})
    md_def_out = MetadataDefinitionOut.from_mongo(found)
    return md_def_out


@router.get("/definition", response_model=List[MetadataDefinitionOut])
async def get_definition(
    name: Optional[str] = None,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 2
):
    definitions = []
    if name is None: root_query = db["metadata.definitions"].find()
    else: root_query = db["metadata.definitions"].find({"name": name})

    for doc in (
        await root_query.skip(skip).limit(limit).to_list(length=limit)
    ):
        definitions.append(MetadataDefinitionOut.from_mongo(doc))
    return definitions


@router.patch("/{metadata_id}", response_model=MetadataOut)
async def update_metadata(
    metadata_id: str,
    in_metadata: MetadataIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    """Patch endpoint to update only specific subset of fields in a metadata object."""
    if (md := await db["metadata"].find_one({"_id": ObjectId(metadata_id)})) is not None:
        # TODO: Refactor this with permissions checks etc.
        try:
            md.update({"contents": dict(in_metadata)})
            await db["metadata"].replace_one(
                {"_id": ObjectId(metadata_id)}, MetadataDB(**metadata).to_mongo()
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return MetadataOut.from_mongo(metadata)

    metadata = MetadataDB(
        **in_metadata.dict(),
        resource=file_ref,
        agent=agent,
    )
    new_metadata = await db["metadata"].insert_one(metadata.to_mongo())
    found = await db["metadata"].find_one({"_id": new_metadata.inserted_id})
    metadata_out = MetadataOut.from_mongo(found)
    return metadata_out
