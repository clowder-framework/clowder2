from bson import ObjectId
from fastapi import APIRouter, Request
from app.models.users import User

router = APIRouter()


@router.post('/users', response_model=User)
async def save_me(body: User, request: Request):
    res = await request.app.db["users"].insert_one(body.mongo())
    found = await request.app.db["users"].find_one({'_id': res.inserted_id})
    return User.from_mongo(found)


@router.get("/users/{user_id}", response_model=User)
async def read_root(user_id: str, request: Request):
    found = await request.app.db["items"].find_one({'_id': user_id})
    return User.from_mongo(found)
