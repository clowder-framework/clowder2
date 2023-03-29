from typing import List
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from pymongo import MongoClient
from datetime import datetime
from itsdangerous.url_safe import URLSafeSerializer
from itsdangerous.exc import BadSignature
from secrets import token_urlsafe

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


@router.post("/keys", response_model=str)
async def generate_user_api_key(
    db: MongoClient = Depends(dependencies.get_db),
    current_user=Depends(get_current_username),
):
    serializer = URLSafeSerializer(settings.local_auth_secret, salt="api_key")
    unique_key = token_urlsafe(16)
    hashed_key = serializer.dumps({"user": current_user, "key": unique_key})

    db["user_keys"].insert_one(UserAPIKey(user=current_user, key=unique_key).to_mongo())

    return hashed_key


@router.post("/keys/{key_id}")
async def validate_user_api_key(
    key_id: str, db: MongoClient = Depends(dependencies.get_db)
):
    serializer = URLSafeSerializer(settings.local_auth_secret, salt="api_key")

    try:
        payload = serializer.loads(key_id)

        # Key is valid, check expiration date in database
        if (
            key_entry := await db["user_keys"].find_one(
                {"user": payload["user"], "key": payload["key"]}
            )
        ) is not None:
            key = UserAPIKey.from_mongo(key_entry)
            current_time = datetime.utcnow()
            mins_since = int((current_time - key.created).total_seconds() / 60)

            if mins_since > settings.local_auth_expiration:
                # Expired key, delete it first
                db["user_keys"].remove({"_id": ObjectId(key.id)})
                raise HTTPException(
                    status_code=401,
                    detail={"error": "Key is expired."},
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return True
        else:
            raise HTTPException(
                status_code=401,
                detail={"error": "Key is invalid."},
                headers={"WWW-Authenticate": "Bearer"},
            )
    except BadSignature as e:
        raise HTTPException(
            status_code=401,
            detail={"error": "Key is invalid."},
            headers={"WWW-Authenticate": "Bearer"},
        )
