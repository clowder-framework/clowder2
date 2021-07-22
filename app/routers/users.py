from typing import List

from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException
from app.models.users import User

router = APIRouter()


@router.post('/users', response_model=User)
async def save_user(body: User, request: Request):
    res = await request.app.db["users"].insert_one(body.mongo())
    found = await request.app.db["users"].find_one({'_id': res.inserted_id})
    return User.from_mongo(found)


@router.get("/users", response_model=List[User])
async def get_users(request: Request, skip: int = 0, limit: int = 2):
    users = []
    for doc in await request.app.db["users"].find().skip(skip).limit(limit).to_list(length=limit):
        users.append(doc)
    return users


@router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, request: Request):
    if (user := await request.app.db["users"].find_one({"_id": ObjectId(user_id)})) is not None:
        return user
    raise HTTPException(status_code=404, detail=f"User {user_id} not found")
