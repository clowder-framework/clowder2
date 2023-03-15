from typing import List

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from pydantic.networks import EmailStr
from pymongo import MongoClient
from bson import ObjectId

from app import dependencies
from app.keycloak_auth import get_current_username, get_user
from app.dependencies import get_db
from app.models.pyobjectid import PyObjectId
from app.models.datasets import DatasetOut
from app.models.groups import GroupOut, GroupDB, GroupBase
from app.deps.authorization_deps import (
    Authorization,
    get_role,
    get_role_by_file,
    get_role_by_metadata,
)
from app.models.authorization import (
    AuthorizationBase,
    AuthorizationFile,
    AuthorizationMetadata,
    AuthorizationDB,
    RoleType,
)

router = APIRouter()


@router.post("/datasets/{dataset_id}", response_model=AuthorizationDB)
async def save_authorization(
    dataset_id: str,
    authorization_in: AuthorizationBase,
    user=Depends(get_current_username),
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
            missing_groups.remove(group.id)
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


@router.get("/files/{file_id}/role", response_model=RoleType)
async def get_file_role(
    file_id: str,
    current_user=Depends(get_current_username),
    role: RoleType = Depends(get_role_by_file),
):
    """Retrieve role of user for an individual file. Role cannot change between file versions."""
    return role


@router.get("/metadata/{metadata_id}/role", response_model=AuthorizationMetadata)
async def get_metadata_role(
    metadata_id: str,
    current_user=Depends(get_current_username),
    role: RoleType = Depends(get_role_by_metadata),
):
    """Retrieve role of user for metadata. Role cannot change between metadata versions."""
    return role


@router.post(
    "/datasets/{dataset_id}/group_role/{group_id}/{role}",
    response_model=AuthorizationDB,
)
async def set_group_role(
    dataset_id: str,
    group_id: str,
    role: RoleType,
    db: MongoClient = Depends(get_db),
    user_id=Depends(get_user),
    allow: bool = Depends(Authorization("editor")),
):
    """Assign an entire group a specific role for a dataset."""

    if (
        dataset_q := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        dataset = DatasetOut.from_mongo(dataset_q)
        if (
            group_q := await db["groups"].find_one({"_id": ObjectId(group_id)})
        ) is not None:
            group = GroupOut.from_mongo(group_q)
            # First, remove any existing role the group has on the dataset
            remove_group_role(dataset_id, group_id, db, user_id, allow)

            if (
                auth_q := await db["authorization"].find_one(
                    {"dataset_id": ObjectId(dataset_id), "role": role}
                )
            ) is not None:
                # Update existing role entry for this dataset
                auth_db = AuthorizationDB.from_mongo(auth_q)
                auth_db.group_ids.append(ObjectId(group_id))
                for u in group.users:
                    auth_db.user_ids.append(u.user.email)
                await db["authorization"].replace_one(
                    {"_id": auth_db.id}, auth_db.to_mongo()
                )
                return auth_db
            else:
                # Create new role entry for this dataset
                user_ids = []
                for u in group.users:
                    user_ids.append(u.user.email)
                auth_db = AuthorizationDB(
                    creator=user_id,
                    dataset_id=PyObjectId(dataset_id),
                    role=role,
                    group_ids=[PyObjectId(group_id)],
                    user_ids=user_ids,
                )
                await db["authorization"].insert_one(auth_db.to_mongo())
                return auth_db
        else:
            raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post(
    "/datasets/{dataset_id}/user_role/{username}/{role}", response_model=AuthorizationDB
)
async def set_user_role(
    dataset_id: str,
    username: str,
    role: RoleType,
    db: MongoClient = Depends(get_db),
    user_id=Depends(get_user),
    allow: bool = Depends(Authorization("editor")),
):
    """Assign a single user a specific role for a dataset."""

    if (
        dataset_q := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        dataset = DatasetOut.from_mongo(dataset_q)
        if (user_q := await db["users"].find_one({"email": username})) is not None:
            if role not in ["editor", "member"]:
                raise HTTPException(
                    status_code=403, detail="Group role must either be member or owner."
                )

            # First, remove any existing role the user has on the dataset
            await remove_user_role(dataset_id, username, db, user_id, allow)

            if (
                auth_q := await db["authorization"].find_one(
                    {"dataset_id": ObjectId(dataset_id), "role": role}
                )
            ) is not None:
                # Update if it already exists
                auth_db = AuthorizationDB.from_mongo(auth_q)
                auth_db.user_ids.append(username)
                await db["authorization"].replace_one(
                    {"_id": auth_db.id}, auth_db.to_mongo()
                )
                return auth_db
            else:
                # Create a new entry
                auth_db = AuthorizationDB(
                    creator=user_id,
                    dataset_id=PyObjectId(dataset_id),
                    role=role,
                    user_ids=[username],
                )
                await db["authorization"].insert_one(auth_db.to_mongo())
                return auth_db

        else:
            raise HTTPException(status_code=404, detail=f"User {username} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.delete(
    "/datasets/{dataset_id}/group_role/{group_id}",
    response_model=AuthorizationDB,
)
async def remove_group_role(
    dataset_id: str,
    group_id: str,
    db: MongoClient = Depends(get_db),
    user_id=Depends(get_user),
    allow: bool = Depends(Authorization("editor")),
):
    """Remove any role the group has with a specific dataset."""

    if (
        dataset_q := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        dataset = DatasetOut.from_mongo(dataset_q)
        if (
            group_q := await db["groups"].find_one({"_id": ObjectId(group_id)})
        ) is not None:
            group = GroupOut.from_mongo(group_q)
            if (
                auth_q := await db["authorization"].find_one(
                    {
                        "dataset_id": ObjectId(dataset_id),
                        "group_ids": ObjectId(group_id),
                    }
                )
            ) is not None:
                # Remove group from affected authorizations
                auth_db = AuthorizationDB.from_mongo(auth_q)
                auth_db.group_ids.remove(ObjectId(group_id))
                for u in group.users:
                    auth_db.user_ids.remove(u.user.email)
                await db["authorization"].replace_one(
                    {"_id": auth_db.id}, auth_db.to_mongo()
                )
                return auth_db
        else:
            raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.delete(
    "/datasets/{dataset_id}/user_role/{username}",
    response_model=AuthorizationDB,
)
async def remove_user_role(
    dataset_id: str,
    username: str,
    db: MongoClient = Depends(get_db),
    user_id=Depends(get_user),
    allow: bool = Depends(Authorization("editor")),
):
    """Remove any role the user has with a specific dataset."""

    if (
        dataset_q := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        dataset = DatasetOut.from_mongo(dataset_q)
        if (user_q := await db["users"].find_one({"email": username})) is not None:
            if (
                auth_q := await db["authorization"].find_one(
                    {"dataset_id": ObjectId(dataset_id), "user_ids": username}
                )
            ) is not None:
                # Remove user from affected authorizations
                auth_db = AuthorizationDB.from_mongo(auth_q)
                auth_db.user_ids.remove(username)
                await db["authorization"].replace_one(
                    {"_id": auth_db.id}, auth_db.to_mongo()
                )
                return auth_db
        else:
            raise HTTPException(status_code=404, detail=f"User {username} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
