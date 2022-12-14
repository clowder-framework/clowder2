from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends
from pymongo import MongoClient

from app import keycloak_auth, dependencies
from app.models.authorization import AuthorizationBase, AuthorizationDB

router = APIRouter()

@router.post("", response_model=AuthorizationDB)
async def save_authorization(
    authorization_in: AuthorizationBase,
    user=Depends(keycloak_auth.get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    authorization_db = AuthorizationDB(**authorization_in.dict(), author=user)
    new_authorization = await db["authorization"].insert_one(authorization_db.to_mongo())
    return new_authorization