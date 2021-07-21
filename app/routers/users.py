from bson import ObjectId
from fastapi import APIRouter, Request
from app.models.users import User

router = APIRouter()


@router.post('/user', response_model=User)
async def save_me(body: User, request: Request):
    assert isinstance(body.id, ObjectId)
    res = await request.app.db["users"].insert_one(body.mongo())
    assert res.inserted_id == body.id

    found = await db["users"].find_one({'_id': res.inserted_id})
    return User.from_mongo(found)


@router.get("/user/{user_id}", response_model=User)
async def read_root(user_id: str, request: Request):
    found = await request.app.db["items"].find_one({'_id': user_id})
    return User.from_mongo(found)
