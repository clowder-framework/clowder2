from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from passlib.hash import bcrypt
from pymongo import MongoClient

from app import dependencies
from app.models.users import UserDB, UserIn
from app.auth import AuthHandler

auth_handler = AuthHandler()

router = APIRouter()


@router.post("/users", response_model=UserDB)
async def save_user(userIn: UserIn, db: MongoClient = Depends(dependencies.get_db)):
    hashed_password = bcrypt.hash(userIn.password)
    userDB = UserDB(**userIn.dict(), hashed_password=hashed_password)
    res = await db["users"].insert_one(userDB.to_mongo())
    found = await db["users"].find_one({"_id": res.inserted_id})
    return UserDB.from_mongo(found).dict(exclude={"create_at"})


@router.post("/login")
async def login(userIn: UserIn, db: MongoClient = Depends(dependencies.get_db)):
    authenticated_user = await authenticate_user(userIn.email, userIn.password, db)
    if authenticated_user is None:
        raise HTTPException(
            status_code=401, detail=f"Could not authenticate user credentials"
        )
    else:
        token = auth_handler.encode_token(str(authenticated_user.id))
        return {"token": token}


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
