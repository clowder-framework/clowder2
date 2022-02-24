from typing import List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from pymongo import MongoClient

from app import dependencies
from app.models.users import UserDB, UserIn, UserOut
from passlib.hash import bcrypt

router = APIRouter()


@router.post("", response_model=UserOut)
async def save_user(userIn: UserIn, db: MongoClient = Depends(dependencies.get_db)):
    hashed_password = bcrypt.hash(userIn.password)
    userDB = UserDB(**userIn.dict(), hashed_password=hashed_password)
    res = await db["users"].insert_one(userDB.to_mongo())
    found = await db["users"].find_one({"_id": res.inserted_id})
    return UserDB.from_mongo(found).dict(exclude={"create_at"})


@router.get("", response_model=List[UserOut])
async def get_users(
    db: MongoClient = Depends(dependencies.get_db), skip: int = 0, limit: int = 2
):
    users = []
    for doc in await db["users"].find().skip(skip).limit(limit).to_list(length=limit):
        users.append(doc)
    return users


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (user := await db["users"].find_one({"_id": ObjectId(user_id)})) is not None:
        return UserDB.from_mongo(user)
    raise HTTPException(status_code=404, detail=f"User {user_id} not found")


@router.get("/username/{name}", response_model=UserOut)
async def get_user_by_name(name: str, db: MongoClient = Depends(dependencies.get_db)):
    if (user := await db["users"].find_one({"name": name})) is not None:
        return UserDB.from_mongo(user)
    raise HTTPException(status_code=404, detail=f"User {name} not found")
