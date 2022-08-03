from typing import List
import os
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from pymongo import MongoClient

from app import dependencies
from app import keycloak_auth
from app.keycloak_auth import get_user, get_current_user
from app.models.extractors import (
    ExtractorBase,
    ExtractorIn,
    ExtractorDB,
    ExtractorOut,
)

router = APIRouter()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")

@router.post("", response_model=ExtractorOut)
async def save_dataset(
    extractor_in: ExtractorIn,
    user=Depends(keycloak_auth.get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    result = extractor_in.dict()
    extractor_db = ExtractorDB(**extractor_in.dict())
    new_extractor = await db["extractors"].insert_one(extractor_db.to_mongo())
    found = await db["extractors"].find_one({"_id": new_extractor.inserted_id})
    extractor_out = ExtractorOut.from_mongo(found)
    return extractor_out

@router.get("", response_model=List[ExtractorOut])
async def get_extractors(
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 2
):
    extractors = []
    for doc in (
        await db["datasets"]
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    ):
        extractors.append(ExtractorOut.from_mongo(doc))
    return extractors