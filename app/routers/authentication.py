import json

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi import APIRouter, HTTPException, Depends
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError
from passlib.hash import bcrypt
from pymongo import MongoClient
from starlette import status
from app.keycloak import get_user

from app import dependencies
from app.config import settings
from app.keycloak import keycloak_openid
from app.models.users import UserDB, UserIn

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
    try:
        token = keycloak_openid.token(userIn.email, userIn.password)
        return {"token": token["access_token"]}
    # bad credentials
    except KeycloakAuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=json.loads(e.error_message),
            headers={"WWW-Authenticate": "Bearer"},
        )
    # account not fully setup (for example if new password is set to temporary)
    except KeycloakGetError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=json.loads(e.error_message),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def authenticate_user(email: str, password: str, db: MongoClient):
    user = await db["users"].find_one({"email": email})
    current_user = UserDB.from_mongo(user)
    if not user:
        return None
    if not current_user.verify_password(password):
        return None
    return current_user
