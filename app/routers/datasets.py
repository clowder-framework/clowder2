from typing import List
import json
from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException, Depends
from pymongo import MongoClient
from fastapi.encoders import jsonable_encoder
from app import dependencies
from app.models.datasets import Dataset
from app.auth import AuthHandler

router = APIRouter()

auth_handler = AuthHandler()


@router.post("/datasets")
async def save_dataset(
    request: Request,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
):
    res = await db["users"].find_one({"_id": ObjectId(user_id)})
    request_json = await request.json()
    request_json["author"] = res["_id"]
    if "name" in request_json:
        name = request_json["name"]
    else:
        name = 'N/A'
    if "description" in request_json:
        description = request_json["description"]
    else:
        description = 'N/A'
    new_dataset = Dataset(author=res["_id"], name=name, description=description)
    new_dataset_mongo = json.loads(new_dataset.json())
    insert = await db["datasets"].insert_one(new_dataset_mongo)
    found = await db["datasets"].find_one({"_id": insert.inserted_id})
    return Dataset.from_mongo(found)


@router.get("/datasets", response_model=List[Dataset])
async def get_datasets(
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 2,
    mine=False,
):
    datasets = []
    if mine:
        for doc in (
            await db["datasets"]
            .find({"author": ObjectId(user_id)})
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            datasets.append(doc)
    else:
        for doc in (
            await db["datasets"].find().skip(skip).limit(limit).to_list(length=limit)
        ):
            datasets.append(doc)
    return datasets


@router.get("/datasets/{dataset_id}")
async def get_dataset(dataset_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        return Dataset.from_mongo(dataset)
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
