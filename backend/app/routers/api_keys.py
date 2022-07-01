from fastapi import APIRouter, Depends
from pymongo import MongoClient

from app.dependencies import get_db
from app.deps.auth import create_key, create_hash
from app.models.api_keys import APIKeyPOST, APIKeyBase, APIKeyCreate
from app.models.users import UserOut

router = APIRouter()


@router.post("", response_model=APIKeyCreate)
async def save_api_key(
    key_in: APIKeyPOST, db: MongoClient = Depends(get_db)
):
    key = create_key()
    hash = create_hash(key)
    user = UserOut(email="lmarini@illinois.edu")
    key_in_db = APIKeyBase(name=key_in.name, user=user, hash=hash)
    key_stored = await db["apikeys"].insert_one(key_in_db.to_mongo())
    key_out = APIKeyCreate(name=key_in.name, key=key)
    return key_out
