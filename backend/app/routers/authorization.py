from fastapi import APIRouter, Depends
from pymongo import MongoClient

from app import keycloak_auth, dependencies
from app.deps.authorization_deps import Authorization, get_role
from app.models.authorization import AuthorizationBase, AuthorizationDB, RoleType

router = APIRouter()

@router.post("", response_model=AuthorizationDB)
async def save_authorization(
    authorization_in: AuthorizationBase,
    user=Depends(keycloak_auth.get_current_username),
    db: MongoClient = Depends(dependencies.get_db),
):
    authorization_db = AuthorizationDB(**authorization_in.dict(), creator=user)
    new_authorization = await db["authorization"].insert_one(authorization_db.to_mongo())
    found = await db["authorization"].find_one({"_id": new_authorization.inserted_id})
    return AuthorizationDB.from_mongo(found)

@router.get("/datasets/{dataset_id}/role")
async def get_dataset_role(
    dataset_id: str,
    role: RoleType = Depends(get_role)
):
    return {"status": "ok", "dataset_id": dataset_id, "role": role}

@router.get("/datasets/{dataset_id}/role/viewer")
async def get_dataset_extract(
    dataset_id: str,
    allow: bool = Depends(Authorization("viewer"))
):
    return {"status": "ok", "dataset_id": dataset_id, "allow": allow}

@router.get("/datasets/{dataset_id}/role/owner")
async def get_dataset_extract(
    dataset_id: str,
    allow: bool = Depends(Authorization("owner"))
):
    return {"status": "ok", "dataset_id": dataset_id, "allow": allow}

