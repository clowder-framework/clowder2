from datetime import timedelta
from secrets import token_urlsafe
from typing import List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from itsdangerous.url_safe import URLSafeSerializer
from beanie import PydanticObjectId
from pymongo import MongoClient, DESCENDING

from app import dependencies
from app.config import settings
from app.keycloak_auth import get_current_username
from app.models.users import UserDB, UserOut, UserAPIKey, UserAPIKeyOut

router = APIRouter()


@router.get("/keys", response_model=List[UserAPIKeyOut])
async def generate_user_api_key(
    db: MongoClient = Depends(dependencies.get_db),
    current_user=Depends(get_current_username),
    skip: int = 0,
    limit: int = 10,
):
    """List all api keys that user has created

    Arguments:
        skip: number of page to skip
        limit: number to limit per page
    """
    apikeys = []
    for doc in (
        await db["user_keys"]
        .find({"user": current_user})
        .sort([("created", DESCENDING)])
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    ):
        apikeys.append(UserAPIKeyOut.from_mongo(doc))

    return apikeys


@router.post("/keys", response_model=str)
async def generate_user_api_key(
    name: str,
    mins: int = settings.local_auth_expiration,
    db: MongoClient = Depends(dependencies.get_db),
    current_user=Depends(get_current_username),
):
    """Generate an API key that confers the user's privileges.

    Arguments:
        name: name of the api key
        mins: number of minutes before expiration (0 for no expiration)
    """
    serializer = URLSafeSerializer(settings.local_auth_secret, salt="api_key")
    unique_key = token_urlsafe(16)
    hashed_key = serializer.dumps({"user": current_user, "key": unique_key})

    user_key = UserAPIKey(user=current_user, key=unique_key, name=name)
    if mins > 0:
        user_key.expires = user_key.created + timedelta(minutes=mins)
    db["user_keys"].insert_one(user_key.to_mongo())

    return hashed_key


@router.delete("/keys/{key_id}", response_model=UserAPIKeyOut)
async def generate_user_api_key(
    key_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    current_user=Depends(get_current_username),
):
    """Delete API keys given ID

    Arguments:
        key_id: id of the apikey
    """
    apikey_doc = await db["user_keys"].find_one({"_id": ObjectId(key_id)})
    if apikey_doc is not None:
        apikey = UserAPIKeyOut.from_mongo(apikey_doc)

        # Only allow user to delete their own key
        if apikey.user == current_user:
            await db["user_keys"].delete_one({"_id": ObjectId(key_id)})
            return apikey
        else:
            raise HTTPException(
                status_code=403, detail=f"API key {key_id} not allowed to be deleted."
            )
    else:
        raise HTTPException(status_code=404, detail=f"API key {key_id} not found.")


@router.get("", response_model=List[UserOut])
async def get_users(
    db: MongoClient = Depends(dependencies.get_db), skip: int = 0, limit: int = 2
):
    return await UserDB.find({}, skip=skip, limit=limit).to_list()


@router.get("/profile", response_model=UserOut)
async def get_profile(
    username=Depends(get_current_username),
    db: MongoClient = Depends(dependencies.get_db),
):
    if (user := await db["users"].find_one({"email": username})) is not None:
        return UserOut.from_mongo(user)
    raise HTTPException(status_code=404, detail=f"User {username} not found")


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str, db: MongoClient = Depends(dependencies.get_db)):
    user = await UserDB.get(PydanticObjectId(user_id))
    if user is not None:
        return UserOut.from_mongo(**user.dict())
    raise HTTPException(status_code=404, detail=f"User {user_id} not found")


@router.get("/username/{username}", response_model=UserOut)
async def get_user_by_name(
    username: str, db: MongoClient = Depends(dependencies.get_db)
):
    user = UserDB.find(UserDB.email == username)
    if user is not None:
        return UserOut.from_mongo(**user.dict())
    raise HTTPException(status_code=404, detail=f"User {username} not found")


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
    await UserAPIKey.insert_one(user_key)
    return hashed_key
