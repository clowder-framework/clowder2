from typing import List

from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException, Depends
from pymongo import MongoClient

from app import dependencies
from app.models.users import User
from passlib.hash import bcrypt

router = APIRouter()


@router.post("/users", response_model=User)
async def save_user(request: Request, db: MongoClient = Depends(dependencies.get_db)):
    request_json = await request.json()
    plain_password = request_json["password"]
    hashed_password = bcrypt.hash(plain_password)
    new_user = User(name=request_json["name"], hashed_password=hashed_password)
    res = await db["users"].insert_one(new_user.mongo())
    found = await db["users"].find_one({"_id": res.inserted_id})
    return User.from_mongo(found).dict(exclude={"create_at"})


@router.get("/users", response_model=List[User])
async def get_users(
    db: MongoClient = Depends(dependencies.get_db), skip: int = 0, limit: int = 2
):
    users = []
    for doc in await db["users"].find().skip(skip).limit(limit).to_list(length=limit):
        users.append(doc)
    return users


@router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (user := await db["users"].find_one({"_id": ObjectId(user_id)})) is not None:
        return User.from_mongo(user)
    raise HTTPException(status_code=404, detail=f"User {user_id} not found")


@router.get("/users/username/{name}", response_model=User)
async def get_user_by_name(name: str, db: MongoClient = Depends(dependencies.get_db)):
    if (user := await db["users"].find_one({"name": name})) is not None:
        return User.from_mongo(user)
    raise HTTPException(status_code=404, detail=f"User {name} not found")
