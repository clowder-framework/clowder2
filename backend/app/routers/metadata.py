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
from app.auth import AuthHandler
from app.config import settings
from app.models.files import FileIn, FileOut, FileVersion
from app.models.users import UserOut
from app.models.metadata import MetadataIn, MetadataDB, MetadataOut

router = APIRouter()

auth_handler = AuthHandler()



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
