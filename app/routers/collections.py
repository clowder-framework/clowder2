import os
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException
from mongoengine import connect

from app.models.collections import Collection

router = APIRouter()

@router.post('/collections', response_model=Collection)
async def save_collection(body: Collection, request: Request):
    body = body
    res = await request.app.db["collections"].insert_one(body.mongo())
    found = await request.app.db["collections"].find_one({'_id': res.inserted_id})
    return Collection.from_mongo(found)


@router.get("/collections", response_model=List[Collection])
async def get_collections(request: Request, skip: int = 0, limit: int = 2):
    collections = []
    for doc in await request.app.db["collections"].find().skip(skip).limit(limit).to_list(length=limit):
        collections.append(doc)
    return collections


@router.get("/collections/{collection_id}")
async def get_collection(collection_id: str, request: Request):
    if (collection := await request.app.db["collections"].find_one({"_id": ObjectId(collection_id)})) is not None:
        return Collection.from_mongo(collection)
    raise HTTPException(status_code=404, detail=f"Collection {collection_id} not found")