from fastapi import APIRouter, Depends
from pymongo import MongoClient

from app import keycloak_auth, dependencies
from app.deps.authorization_deps import Authorization, get_role, get_role_by_file
from app.keycloak_auth import get_current_username
from app.models.authorization import (
    AuthorizationBase,
    AuthorizationFile,
    AuthorizationDB,
    RoleType,
)
from bson.objectid import ObjectId as BsonObjectId

from app.models.pyobjectid import PyObjectId

router = APIRouter()


@router.post("", response_model=AuthorizationDB)
async def save_authorization(
    authorization_in: AuthorizationBase,
    user=Depends(keycloak_auth.get_current_username),
    db: MongoClient = Depends(dependencies.get_db),
):
    """Save authorization info in Mongo. This is a triple of dataset_id/user_id/role."""
    authorization_db = AuthorizationDB(**authorization_in.dict(), creator=user)
    new_authorization = await db["authorization"].insert_one(
        authorization_db.to_mongo()
    )
    found = await db["authorization"].find_one({"_id": new_authorization.inserted_id})
    return AuthorizationDB.from_mongo(found)


@router.get("/datasets/{dataset_id}/role", response_model=AuthorizationBase)
async def get_dataset_role(
    dataset_id: str,
    current_user=Depends(get_current_username),
    role: RoleType = Depends(get_role),
):
    """Retrieve role of user for a specific dataset."""
    return AuthorizationBase(dataset_id=dataset_id, user_id=current_user, role=role)


@router.get("/datasets/{dataset_id}/role/viewer")
async def get_dataset_role_viewer(
    dataset_id: str, allow: bool = Depends(Authorization("viewer"))
):
    """Used for testing only. Returns true if user has viewer permission on dataset, otherwise throws a 403 Forbidden HTTP exception.
    See `routers/authorization.py` for more info."""
    return {"dataset_id": dataset_id, "allow": allow}


@router.get("/datasets/{dataset_id}/role/owner")
async def get_dataset_role_owner(
    dataset_id: str, allow: bool = Depends(Authorization("owner"))
):
    """Used for testing only. Returns true if user has owner permission on dataset, otherwise throws a 403 Forbidden HTTP exception.
    See `routers/authorization.py` for more info."""
    return {"dataset_id": dataset_id, "allow": allow}


@router.get("/files/{file_id}/role", response_model=AuthorizationFile)
async def get_file_role(
    file_id: str,
    current_user=Depends(get_current_username),
    role: RoleType = Depends(get_role_by_file),
):
    """Retrieve role of user for an individual file. Role cannot change between file versions."""
    return AuthorizationFile(file_id=file_id, user_id=current_user, role=role)
