from bson import ObjectId
from fastapi import APIRouter, Depends
from pymongo import MongoClient

from app import dependencies
from app.models.users import UserDB, UserIn
from app.auth import AuthHandler

auth_handler = AuthHandler()

router = APIRouter()


@router.post("/login")
async def login(userIn: UserIn, db: MongoClient = Depends(dependencies.get_db)):
    authenticated_user = await authenticate_user(userIn.email, userIn.password, db)
    if authenticated_user is not None:
        token = auth_handler.encode_token(str(authenticated_user.id))
        return {"token": token}
    return {"token": "none"}


@router.get("/unprotected")
def unprotected():
    return {"hello": "world"}


@router.get("/protected")
async def protected(
    userid=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
):
    result = await db["users"].find_one({"_id": ObjectId(userid)})
    user = UserDB.from_mongo(result)
    name = user.email
    return {"name": name, "id": userid}


async def authenticate_user(email: str, password: str, db: MongoClient):
    user = await db["users"].find_one({"email": email})
    current_user = UserDB.from_mongo(user)
    if not user:
        return None
    if not current_user.verify_password(password):
        return None
    return current_user
