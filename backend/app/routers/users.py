from datetime import timedelta
from secrets import token_urlsafe
from typing import List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from itsdangerous.url_safe import URLSafeSerializer
from pymongo import MongoClient

from app import dependencies
from app.config import settings
from app.keycloak_auth import get_current_username
from app.models.users import UserOut, UserAPIKey

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


@router.get("/keys", response_model=List[UserAPIKey])
async def generate_user_api_key(
        db: MongoClient = Depends(dependencies.get_db),
        current_user=Depends(get_current_username),
        skip: int = 0,
        limit: int = 10,
):
    """List all api keys that user has created

    Arguments:
        skip -- number of page to skip
        limit -- number to limit per page
    """
    # TODO
    return []


@router.post("/keys", response_model=str)
async def generate_user_api_key(
        mins: int = settings.local_auth_expiration,
        db: MongoClient = Depends(dependencies.get_db),
        current_user=Depends(get_current_username),
):
    """Generate an API key that confers the user's privileges.

    Arguments:
        mins -- number of minutes before expiration (0 for no expiration)
    """
    serializer = URLSafeSerializer(settings.local_auth_secret, salt="api_key")
    unique_key = token_urlsafe(16)
    hashed_key = serializer.dumps({"user": current_user, "key": unique_key})

    user_key = UserAPIKey(user=current_user, key=unique_key)
    if mins > 0:
        user_key.expires = user_key.created + timedelta(minutes=mins)
    db["user_keys"].insert_one(user_key.to_mongo())

    return hashed_key


@router.delete("/keys/{key_id}", response_model=str)
async def generate_user_api_key(
        key_id: str,
        db: MongoClient = Depends(dependencies.get_db),
        current_user=Depends(get_current_username),
):
    """Delete API keys given ID

    Arguments:
        id -- number of minutes before expiration (0 for no expiration)
    """
    # TODO

    return
