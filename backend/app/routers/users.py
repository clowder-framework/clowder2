from datetime import timedelta
from secrets import token_urlsafe
from typing import List

from beanie import PydanticObjectId
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from itsdangerous.url_safe import URLSafeSerializer

from app import dependencies
from app.config import settings
from app.keycloak_auth import get_current_username
from app.models.users import UserDB, UserOut, UserAPIKey, UserAPIKeyOut

router = APIRouter()


@router.get("/keys", response_model=List[UserAPIKeyOut])
async def get_user_api_keys(
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
    for key in (
        await UserAPIKey.find(UserAPIKey.user == current_user)
        .sort(-UserAPIKey.created)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    ):
        apikeys.append(key.dict())

    return apikeys


@router.post("/keys", response_model=str)
async def generate_user_api_key(
    name: str,
    mins: int = settings.local_auth_expiration,
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
    await user_key.insert()
    return hashed_key


@router.delete("/keys/{key_id}", response_model=UserAPIKeyOut)
async def delete_user_api_key(
    key_id: str,
    current_user=Depends(get_current_username),
):
    """Delete API keys given ID

    Arguments:
        key_id: id of the apikey
    """
    if (apikey := await UserAPIKey.get(ObjectId(key_id))) is not None:
        # Only allow user to delete their own key
        if apikey.user == current_user:
            await apikey.delete()
            return apikey
        else:
            raise HTTPException(
                status_code=403, detail=f"API key {key_id} not allowed to be deleted."
            )
    else:
        raise HTTPException(status_code=404, detail=f"API key {key_id} not found.")


@router.get("", response_model=List[UserOut])
async def get_users(skip: int = 0, limit: int = 2):
    users = await UserDB.find({}, skip=skip, limit=limit).to_list()
    return [user.dict() for user in users]


@router.get("/profile", response_model=UserOut)
async def get_profile(
    username=Depends(get_current_username),
):
    if (user := await UserDB.find_one(UserDB.email == username)) is not None:
        return user.dict()
    raise HTTPException(status_code=404, detail=f"User {username} not found")


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str):
    if (user := await UserDB.get(PydanticObjectId(user_id))) is not None:
        return user.dict()
    raise HTTPException(status_code=404, detail=f"User {user_id} not found")


@router.get("/username/{username}", response_model=UserOut)
async def get_user_by_name(username: str):
    if (user := await UserDB.find_one(UserDB.email == username)) is not None:
        return user.dict()
    raise HTTPException(status_code=404, detail=f"User {username} not found")
