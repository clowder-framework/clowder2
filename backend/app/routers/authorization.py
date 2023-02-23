from http.client import HTTPException
from typing import List

from fastapi import APIRouter, Depends
from pydantic.networks import EmailStr
from pymongo import MongoClient

from app import keycloak_auth, dependencies
from app.dependencies import get_db
from app.deps.authorization_deps import Authorization
from app.keycloak_auth import get_current_username
from app.models.authorization import AuthorizationBase, AuthorizationDB
from bson.objectid import ObjectId

from app.models.groups import GroupOut

router = APIRouter()


@router.post("", response_model=AuthorizationDB)
async def save_authorization(
    authorization_in: AuthorizationBase,
    user=Depends(keycloak_auth.get_current_username),
    db: MongoClient = Depends(dependencies.get_db),
):
    """Save authorization info in Mongo. This is a triple of dataset_id/user_id/role/group_id."""

    # Check all connection and abort if any one of them is not available
    if db is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    # Retrieve users from groups in mongo
    user_ids: List[EmailStr] = []
    if (
        group_q := await db["groups"].find_one(
            {"_id": ObjectId(authorization_in.group_id)}
        )
    ) is not None:
        group = GroupOut.from_mongo(group_q)
        user_ids = list(map(lambda user: user.user.email, group.userList))
    else:
        raise HTTPException(
            status_code=404, detail=f"Group {authorization_in.group_id} not found"
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

    # Get group id and the associated userList from authorization
    if (
        authorization_q := await db["authorization"].find_one(
            {"dataset_id": ObjectId(dataset_id)}
        )
    ) is not None:
        authorization = AuthorizationDB.from_mongo(authorization_q)

        if current_user in authorization.user_ids:
            return authorization
        else:
            raise HTTPException(
                status_code=404,
                detail=f"No authorization found for dataset: {dataset_id} and user_id: {current_user}",
            )
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
