from typing import List

from beanie.operators import Or
from bson import ObjectId
from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from pydantic.networks import EmailStr
from pymongo import MongoClient

from app import dependencies
from app.dependencies import get_db
from app.deps.authorization_deps import (
    Authorization,
    get_role_by_file,
    get_role_by_metadata,
    get_role_by_group,
)
from app.keycloak_auth import get_current_username, get_user
from app.models.authorization import (
    AuthorizationBase,
    AuthorizationMetadata,
    AuthorizationDB,
    AuthorizationOut,
    RoleType,
)
from app.models.datasets import DatasetOut, DatasetRoles
from app.models.datasets import GroupAndRole
from app.models.datasets import UserAndRole
from app.models.groups import GroupOut
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut

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
    authorization_db = await AuthorizationDB(
        **authorization_dict, creator=user
    ).insert()
    return authorization_db
    # new_authorization = await db["authorization"].insert_one(
    #     authorization_db.to_mongo()
    # )
    # found = await db["authorization"].find_one({"_id": new_authorization.inserted_id})
    # return AuthorizationDB.from_mongo(found)


@router.get("/datasets/{dataset_id}/role", response_model=AuthorizationDB)
async def get_dataset_role(
        dataset_id: str,
        current_user=Depends(get_current_username),
        db: MongoClient = Depends(get_db),
):
    """Retrieve role of user for a specific dataset."""
    # Get group id and the associated users from authorization
    authorization = await AuthorizationDB.find_one(
        AuthorizationDB.dataset_id == PyObjectId(dataset_id),
        Or(
            AuthorizationDB.creator == current_user,
            AuthorizationDB.user_ids == current_user,
        ),
    )
    # if (
    #         authorization_q := await db["authorization"].find_one(
    #             {
    #                 "$and": [
    #                     {"dataset_id": ObjectId(dataset_id)},
    #                     {"$or": [{"creator": current_user}, {"user_ids": current_user}]},
    #                 ]
    #             }
    #         )
    # ) is not None:
    #     authorization = AuthorizationDB.from_mongo(authorization_q)
    #     return authorization
    if authorization is None:
        raise HTTPException(
            status_code=404, detail=f"No authorization found for dataset: {dataset_id}"
        )
    else:
        return authorization


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
    """Retrieve role of user for group. Group roles can be OWNER, EDITOR, or VIEWER (for regular Members)."""
    return role


@router.get("/groups/{group_id}/role", response_model=RoleType)
async def get_group_role(
        group_id: str,
        current_user=Depends(get_current_username),
        role: RoleType = Depends(get_role_by_group),
):
    """Retrieve role of user on a particular group (i.e. whether they can change group memberships)."""
    return role


@router.post(
    "/datasets/{dataset_id}/group_role/{group_id}/{role}",
    response_model=AuthorizationDB,
)
async def set_dataset_group_role(
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
            await remove_dataset_group_role(dataset_id, group_id, db, user_id, allow)
            auth_db = await AuthorizationDB.find_one(
                AuthorizationDB.dataset_id == PyObjectId(dataset_id),
                AuthorizationDB.role == role,
            )
            # if (
            #         auth_q := await db["authorization"].find_one(
            #             {"dataset_id": ObjectId(dataset_id), "role": role}
            #         )
            # ) is not None:
            # Update existing role entry for this dataset
            # auth_db = AuthorizationDB.from_mongo(auth_q)
            if auth_db is not None:
                if group_id not in auth_db.group_ids:
                    auth_db.group_ids.append(ObjectId(group_id))
                    for u in group.users:
                        auth_db.user_ids.append(u.user.email)
                    await auth_db.save()
                # await db["authorization"].replace_one(
                #     {"_id": auth_db.id}, auth_db.to_mongo()
                # )
                return auth_db
            else:
                # Create new role entry for this dataset
                user_ids = []
                for u in group.users:
                    user_ids.append(u.user.email)
                auth_db = await AuthorizationDB(
                    creator=user_id,
                    dataset_id=PyObjectId(dataset_id),
                    role=role,
                    group_ids=[PyObjectId(group_id)],
                    user_ids=user_ids,
                ).save()
                # await db["authorization"].insert_one(auth_db.to_mongo())
                return auth_db
        else:
            raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post(
    "/datasets/{dataset_id}/user_role/{username}/{role}", response_model=AuthorizationDB
)
async def set_dataset_user_role(
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
            # First, remove any existing role the user has on the dataset
            await remove_dataset_user_role(dataset_id, username, db, user_id, allow)
            auth_db = await AuthorizationDB.find_one(
                AuthorizationDB.dataset_id == PyObjectId(dataset_id),
                AuthorizationDB.role == role,
            )
            # if (
            #         auth_q := await db["authorization"].find_one(
            #             {"dataset_id": ObjectId(dataset_id), "role": role}
            #         )
            # ) is not None:
            # Update if it already exists
            # auth_db = AuthorizationDB.from_mongo(auth_q)
            if auth_db is not None and username not in auth_db.user_ids:
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
async def remove_dataset_group_role(
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
            auth_db = await AuthorizationDB.find_one(
                AuthorizationDB.dataset_id == PyObjectId(dataset_id),
                AuthorizationDB.group_ids == group_id,
            )
            # if (
            #         auth_q := await db["authorization"].find_one(
            #             {
            #                 "dataset_id": ObjectId(dataset_id),
            #                 "group_ids": ObjectId(group_id),
            #             }
            #         )
            # ) is not None:
            #     # Remove group from affected authorizations
            #     auth_db = AuthorizationDB.from_mongo(auth_q)
            if auth_db is not None:
                auth_db.group_ids.remove(PyObjectId(group_id))
                for u in group.users:
                    if u.user.email in auth_db.user_ids:
                        auth_db.user_ids.remove(u.user.email)
                await auth_db.save()
                # await db["authorization"].replace_one(
                #     {"_id": auth_db.id}, auth_db.to_mongo()
                # )
                return auth_db
        else:
            raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.delete(
    "/datasets/{dataset_id}/user_role/{username}",
    response_model=AuthorizationDB,
)
async def remove_dataset_user_role(
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
            auth_db = await AuthorizationDB.find_one(
                AuthorizationDB.dataset_id == PyObjectId(dataset_id),
                AuthorizationDB.user_ids == username,
            )
            # if (
            #         auth_q := await db["authorization"].find_one(
            #             {"dataset_id": ObjectId(dataset_id), "user_ids": username}
            #         )
            # ) is not None:
            #     Remove user from affected authorizations
            # auth_db = AuthorizationDB.from_mongo(auth_q)
            if auth_db is not None:
                auth_db.user_ids.remove(username)
                await db["authorization"].replace_one(
                    {"_id": auth_db.id}, auth_db.to_mongo()
                )
                return auth_db
        else:
            raise HTTPException(status_code=404, detail=f"User {username} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/datasets/{dataset_id}/roles", response_model=DatasetRoles)
async def get_dataset_roles(
        dataset_id: str,
        db: MongoClient = Depends(dependencies.get_db),
        allow: bool = Depends(Authorization("editor")),
):
    """Get a list of all users and groups that have assigned roles on this dataset."""
    if (
            dataset_q := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        dataset = DatasetOut.from_mongo(dataset_q)
        roles = DatasetRoles(dataset_id=str(dataset.id))

        async for auth_q in db["authorization"].find(
                {"dataset_id": ObjectId(dataset_id)}
        ):
            auth = AuthorizationOut.from_mongo(auth_q)

            # First, fetch all groups that have a role on the dataset
            group_user_counts = {}
            async for group_q in db["groups"].find({"_id": {"$in": auth.group_ids}}):
                group = GroupOut.from_mongo(group_q)
                group.id = str(group.id)
                for u in group.users:
                    u.user.id = str(u.user.id)
                    # Count number of appearances of this username in groups, for reference below
                    if u.user.email not in group_user_counts:
                        group_user_counts[u.user.email] = 1
                    else:
                        group_user_counts[u.user.email] += 1
                roles.group_roles.append(GroupAndRole(group=group, role=auth.role))

            # Next, get all users but omit those that are included in a group above
            async for user_q in db["users"].find({"email": {"$in": auth.user_ids}}):
                user = UserOut.from_mongo(user_q)
                if (
                        user.email in group_user_counts
                        and auth.user_ids.count(user.email) == group_user_counts[user.email]
                ):
                    continue
                # TODO: Why is this necessary here but not on root-level ObjectIDs?
                user.id = str(user.id)
                roles.user_roles.append(UserAndRole(user=user, role=auth.role))

        return roles
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
