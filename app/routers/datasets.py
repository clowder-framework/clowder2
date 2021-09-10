import os
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException
from mongoengine import connect

from app.models.datasets import Dataset, MongoDataset

router = APIRouter()

DATABASE_URI = os.environ["MONGODB_URL"]
db=DATABASE_URI+"/clowder"
connect(host=db)

@router.post('/datasets', response_model=Dataset)
async def save_dataset(body: Dataset, request: Request):
    dataset = MongoDataset(**body.dict()).save()
    return Dataset(**dataset.dict())


@router.get("/datasets", response_model=List[Dataset])
async def get_users(request: Request, skip: int = 0, limit: int = 2):
    datasets = []
    for dataset in MongoDataset.objects[skip:skip+limit]:
        datasets.append(Dataset(**dataset.json()))
    return datasets


@router.get("/datasets/{dataset_id}", response_model=Dataset)
async def get_user(dataset_id: str, request: Request):
    return MongoDataset.objects(id=dataset_id)
