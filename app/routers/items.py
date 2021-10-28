from typing import List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Body, Depends
from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient
from starlette import status
from starlette.responses import JSONResponse

from app import dependencies
from app.models.items import Item

router = APIRouter()


@router.post("/items", response_description="Add a new item", response_model=Item)
async def create_item(
    item: Item,
    db: MongoClient = Depends(dependencies.get_db),
):
    item_status = await db["items"].insert_one(item.mongo())
    created = await db["items"].find_one({"_id": item_status.inserted_id})
    return Item.from_mongo(created)


@router.get("/items", response_description="List items", response_model=List[Item])
async def read_items(
    db: MongoClient = Depends(dependencies.get_db), skip: int = 0, limit: int = 2
):
    tasks = []
    for doc in await db["items"].find().skip(skip).limit(limit).to_list(length=limit):
        tasks.append(doc)
    return tasks


@router.get("/items/{item_id}", response_model=Item)
async def read_item(
    item_id: str,
    db: MongoClient = Depends(dependencies.get_db),
):
    if (item := await db["items"].find_one({"_id": ObjectId(item_id)})) is not None:
        return item
    raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
