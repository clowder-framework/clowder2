from typing import List
import os
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from pymongo import MongoClient
import datetime
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
async def save_extractor(
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

@router.get("/{extractor_id}", response_model=ExtractorOut)
async def get_extractor(extractor_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (
        extractor := await db["extractors"].find_one({"_id": ObjectId(extractor_id)})
    ) is not None:
        return ExtractorOut.from_mongo(extractor)
    raise HTTPException(status_code=404, detail=f"Extractor {extractor_id} not found")

@router.get("", response_model=List[ExtractorOut])
async def get_extractors(
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 2
):
    extractors = []
    for doc in (
        await db["extractors"]
        .find()
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    ):
        extractors.append(ExtractorOut.from_mongo(doc))
    return extractors

@router.put("/{extractor_id}", response_model=ExtractorOut)
async def edit_extractor(
    extractor_id: str,
    extractor_info: ExtractorBase,
    db: MongoClient = Depends(dependencies.get_db),
    user_id=Depends(get_user),
):
    if (
        extractor := await db["extractors"].find_one({"_id": ObjectId(extractor_id)})
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        ex = dict(extractor_info) if extractor_info is not None else {}
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        ex["updated"] = datetime.datetime.utcnow()
        try:
            extractor.update(ex)
            await db["extractors"].replace_one(
                {"_id": ObjectId(extractor_id)}, ExtractorDB(**extractor).to_mongo()
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return ExtractorOut.from_mongo(extractor)
    raise HTTPException(status_code=404, detail=f"Extractor {extractor_id} not found")

@router.delete("/{extractor_id}")
async def delete_extractor(
    extractor_id: str,
    db: MongoClient = Depends(dependencies.get_db),
):
    if (await db["extractors"].find_one({"_id": ObjectId(extractor_id)})) is not None:
        # delete dataset first to minimize files/folder being uploaded to a delete dataset

        await db["extractors"].delete_one({"_id": ObjectId(extractor_id)})
        return {"deleted": extractor_id}
    else:
        raise HTTPException(status_code=404, detail=f"Extractor {extractor_id} not found")
