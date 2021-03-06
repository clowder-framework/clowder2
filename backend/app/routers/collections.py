from typing import List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from pymongo import MongoClient

from app import dependencies
from app.models.collections import Collection

router = APIRouter()


@router.post("/", response_model=Collection)
async def save_collection(
    body: Collection, db: MongoClient = Depends(dependencies.get_db)
):
    body = body
    res = await db["collections"].insert_one(body.to_mongo())
    found = await db["collections"].find_one({"_id": res.inserted_id})
    return Collection.from_mongo(found)


@router.get("/", response_model=List[Collection])
async def get_collections(
    db: MongoClient = Depends(dependencies.get_db), skip: int = 0, limit: int = 2
):
    collections = []
    for doc in (
        await db["collections"].find().skip(skip).limit(limit).to_list(length=limit)
    ):
        collections.append(doc)
    return collections


@router.get("/{collection_id}")
async def get_collection(
    collection_id: str, db: MongoClient = Depends(dependencies.get_db)
):
    if (
        collection := await db["collections"].find_one({"_id": ObjectId(collection_id)})
    ) is not None:
        return Collection.from_mongo(collection)
    raise HTTPException(status_code=404, detail=f"Collection {collection_id} not found")
