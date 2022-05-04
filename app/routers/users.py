from typing import List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from pymongo import MongoClient

from app import dependencies
from app.models.users import UserOut

router = APIRouter()


@router.get("", response_model=List[UserOut])
async def get_users(
    db: MongoClient = Depends(dependencies.get_db), skip: int = 0, limit: int = 2
):
    users = []
    for doc in await db["users"].find().skip(skip).limit(limit).to_list(length=limit):
        users.append(UserOut(**doc))
    return users


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (user := await db["users"].find_one({"_id": ObjectId(user_id)})) is not None:
        return UserOut.from_mongo(user)
    raise HTTPException(status_code=404, detail=f"User {user_id} not found")


@router.get("/username/{username}", response_model=UserOut)
async def get_user_by_name(
    username: str, db: MongoClient = Depends(dependencies.get_db)
):
    if (user := await db["users"].find_one({"email": username})) is not None:
        return UserOut.from_mongo(user)
    raise HTTPException(status_code=404, detail=f"User {username} not found")
