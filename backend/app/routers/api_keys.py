from fastapi import APIRouter, Depends
from pymongo import MongoClient

from app import deps
from app.deps.auth import create_key, create_hash
from app.models.api_keys import APIKeyPOST, APIKeyBase, APIKeyCreate
from app.models.users import UserOut

router = APIRouter()


@router.post("", response_model=APIKeyPOST)
async def save_api_key(
    key_in: APIKeyPOST, db: MongoClient = Depends(deps.get_db)
):
    key = create_key()
    hash = create_hash(key)
    key_in_db = APIKeyBase(key_in.name, UserOut("lmarini@illinois.edu"), hash)
    key_stored = await db["apikeys"].insert_one(key_in_db.to_mongo())
    key_out = APIKeyCreate(key_in.name, key)
    return key_out
