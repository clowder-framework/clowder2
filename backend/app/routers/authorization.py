from typing import List

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from pydantic.networks import EmailStr
from pymongo import MongoClient
from bson import ObjectId

from app import keycloak_auth, dependencies
from app.dependencies import get_db
from app.models.groups import GroupOut, GroupDB, GroupBase
from app.deps.authorization_deps import Authorization, get_role, get_role_by_file
from app.keycloak_auth import get_current_username
from app.models.authorization import (
    AuthorizationBase,
    AuthorizationFile,
    AuthorizationDB,
    RoleType,
)

router = APIRouter()


@router.post("/datasets/{dataset_id}", response_model=AuthorizationDB)
async def save_authorization(
    dataset_id: str,
    authorization_in: AuthorizationBase,
    user=Depends(keycloak_auth.get_current_username),
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(Authorization("editor")),
):
    """Save authorization info in Mongo. This is a triple of dataset_id/user_id/role/group_id."""

    # Retrieve users from groups in mongo
    user_ids: List[EmailStr] = authorization_in.user_ids
    group_q_list = db["groups"].find({"_id": {"$in": authorization_in.group_ids}})
    found_groups = 0
    async for group_q in group_q_list:
        found_groups += 1
        group = GroupOut.from_mongo(group_q)
        for u in group.users:
            user_ids.append(u.user.email)
    if found_groups != len(authorization_in.group_ids):
        missing_groups = authorization_in.group_ids
        async for group_q in group_q_list:
            group = GroupOut.from_mongo(group_q)
            missing_groups.pop(group.id)
        raise HTTPException(
            status_code=404, detail=f"Groups not found: {missing_groups}"
        )

    authorization_dict = authorization_in.dict()
    authorization_dict["user_ids"] = user_ids
    authorization_db = AuthorizationDB(**authorization_dict, creator=user)
    new_authorization = await db["authorization"].insert_one(
        authorization_db.to_mongo()
    )
    found = await db["authorization"].find_one({"_id": new_authorization.inserted_id})
    return AuthorizationDB.from_mongo(found)


@router.get("/datasets/{dataset_id}/role", response_model=AuthorizationDB)
async def get_dataset_role(
    dataset_id: str,
    current_user=Depends(get_current_username),
    db: MongoClient = Depends(get_db),
):
    """Retrieve role of user for a specific dataset."""
    # Get group id and the associated users from authorization
    if (
        authorization_q := await db["authorization"].find_one(
            {
                "$and": [
                    {"dataset_id": ObjectId(dataset_id)},
                    {"$or": [{"creator": current_user}, {"user_ids": current_user}]},
                ]
            }
        )
    ) is not None:
        authorization = AuthorizationDB.from_mongo(authorization_q)
        return authorization
    else:
        raise HTTPException(
            status_code=404, detail=f"No authorization found for dataset: {dataset_id}"
        )


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
    return role
