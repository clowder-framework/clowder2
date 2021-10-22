from bson import ObjectId
from fastapi import APIRouter, Depends
from pymongo import MongoClient

from app import dependencies
from app.models.users import User, AuthDetails
from app.auth import AuthHandler

auth_handler = AuthHandler()

router = APIRouter()


@router.post("/login")
async def login(auth: AuthDetails, db: MongoClient = Depends(dependencies.get_db)):
    authenticated_user = await authenticate_user(auth.name, auth.password, db)
    if authenticated_user is not None:
        token = auth_handler.encode_token(str(authenticated_user.id))
        return {"token": token}
    return {"token": "none"}


@router.post("/signin")
async def sign_in(auth: AuthDetails, db: MongoClient = Depends(dependencies.get_db)):
    name = auth.name
    password = auth.password
    current_user = await authenticate_user(name, password, db)
    return current_user


@router.get("/unprotected")
def unprotected():
    return {"hello": "world"}


@router.get("/protected")
async def protected(
    userid=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
):
    result = await db["users"].find_one({"_id": ObjectId(userid)})
    user = User.from_mongo(result)
    name = user.name
    return {"name": name, "id": userid}


async def authenticate_user(name: str, password: str, db: MongoClient):
    user = await db["users"].find_one({"name": name})
    current_user = User.from_mongo(user)
    if not user:
        return None
    if not current_user.verify_password(password):
        return None
    return current_user
