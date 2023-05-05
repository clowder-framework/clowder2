from beanie.operators import Or
from bson import ObjectId
from fastapi import Depends, HTTPException
from pymongo import MongoClient

from app.dependencies import get_db
from app.keycloak_auth import get_current_username
from app.models.authorization import RoleType, AuthorizationDB
from app.models.datasets import DatasetOut
from app.models.files import FileOut
from app.models.groups import GroupOut
from app.models.metadata import MetadataOut
from app.models.pyobjectid import PyObjectId


async def get_role(
    dataset_id: str,
    db: MongoClient = Depends(get_db),
    current_user=Depends(get_current_username),
) -> RoleType:
    """Returns the role a specific user has on a dataset. If the user is a creator (owner), they are not listed in
    the user_ids list."""
    authorization = await AuthorizationDB.find_one(
        AuthorizationDB.dataset_id == PyObjectId(dataset_id),
        Or(
            AuthorizationDB.creator == current_user,
            AuthorizationDB.user_ids == current_user,
        ),
    )
    return authorization.role
    # authorization = await db["authorization"].find_one(
    #     {
    #         "$and": [
    #             {"dataset_id": ObjectId(dataset_id)},
    #             {"$or": [{"creator": current_user}, {"user_ids": current_user}]},
    #         ]
    #     }
    # )
    # role = AuthorizationDB.from_mongo(authorization).role
    # return role


async def get_role_by_file(
    file_id: str,
    db: MongoClient = Depends(get_db),
    current_user=Depends(get_current_username),
) -> RoleType:
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        file_out = FileOut.from_mongo(file)
        authorization = await AuthorizationDB.find_one(
            AuthorizationDB.dataset_id == file_out.dataset_id,
            Or(
                AuthorizationDB.creator == current_user,
                AuthorizationDB.user_ids == current_user,
            ),
        )
        return authorization.role
        # authorization = await db["authorization"].find_one(
        #     {
        #         "$and": [
        #             {"dataset_id": ObjectId(file_out.dataset_id)},
        #             {"$or": [{"creator": current_user}, {"user_ids": current_user}]},
        #         ]
        #     }
        # )
        # role = AuthorizationDB.from_mongo(authorization).role
        # return role

    raise HTTPException(status_code=404, detail=f"File {file_id} not found")


async def get_role_by_metadata(
    metadata_id: str,
    db: MongoClient = Depends(get_db),
    current_user=Depends(get_current_username),
) -> RoleType:
    if (
        metadata := await db["metadata"].find_one({"_id": ObjectId(metadata_id)})
    ) is not None:
        md_out = MetadataOut.from_mongo(metadata)
        resource_type = md_out.resource.collection
        resource_id = md_out.resource.resource_id
        if resource_type == "files":
            if (
                file := await db["files"].find_one({"_id": ObjectId(resource_id)})
            ) is not None:
                file_out = FileOut.from_mongo(file)
                authorization = await AuthorizationDB.find_one(
                    AuthorizationDB.dataset_id == file_out.dataset_id,
                    Or(
                        AuthorizationDB.creator == current_user,
                        AuthorizationDB.user_ids == current_user,
                    ),
                )
                return authorization.role
                # authorization = await db["authorization"].find_one(
                #     {
                #         "$and": [
                #             {"dataset_id": ObjectId(file_out.dataset_id)},
                #             {
                #                 "$or": [
                #                     {"creator": current_user},
                #                     {"user_ids": current_user},
                #                 ]
                #             },
                #         ]
                #     }
                # )
                # role = AuthorizationDB.from_mongo(authorization).role
                # return role
        elif resource_type == "datasets":
            if (
                dataset := await db["datasets"].find_one({"_id": ObjectId(resource_id)})
            ) is not None:
                dataset_out = DatasetOut.from_mongo(dataset)
                authorization = await AuthorizationDB.find_one(
                    AuthorizationDB.dataset_id == dataset_out.dataset_id,
                    Or(
                        AuthorizationDB.creator == current_user,
                        AuthorizationDB.user_ids == current_user,
                    ),
                )
                return authorization.role
                # authorization = await db["authorization"].find_one(
                #     {
                #         "$and": [
                #             {"dataset_id": ObjectId(dataset_out.dataset_id)},
                #             {
                #                 "$or": [
                #                     {"creator": current_user},
                #                     {"user_ids": current_user},
                #                 ]
                #             },
                #         ]
                #     }
                # )
                # role = AuthorizationDB.from_mongo(authorization).role
                # return role


async def get_role_by_group(
    group_id: str,
    db: MongoClient = Depends(get_db),
    current_user=Depends(get_current_username),
) -> RoleType:
    if (group := await db["groups"].find_one({"_id": ObjectId(group_id)})) is not None:
        group_out = GroupOut.from_mongo(group)
        if group_out.creator == current_user:
            # Creator can do everything
            return RoleType.OWNER
        for u in group_out.users:
            if u.user.email == current_user:
                if u.editor:
                    return RoleType.EDITOR
                else:
                    return RoleType.VIEWER
        raise HTTPException(
            status_code=403,
            detail=f"User `{current_user} does not have any permissions on group {group_id}",
        )
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


class Authorization:
    """We use class dependency so that we can provide the `permission` parameter to the dependency.
    For more info see https://fastapi.tiangolo.com/advanced/advanced-dependencies/."""

    def __init__(self, role: str):
        self.role = role

    async def __call__(
        self,
        dataset_id: str,
        db: MongoClient = Depends(get_db),
        current_user: str = Depends(get_current_username),
    ):
        # TODO: Make sure we enforce only one role per user per dataset, or find_one could yield wrong answer here.
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
        #                     {
        #                         "$or": [
        #                             {"creator": current_user},
        #                             {"user_ids": current_user},
        #                         ]
        #                     },
        #                 ]
        #             }
        #         )
        # ) is not None:
        #     authorization = AuthorizationDB.from_mongo(authorization_q)
        if authorization is not None:
            if access(authorization.role, self.role):
                return True
            else:
                raise HTTPException(
                    status_code=403,
                    detail=f"User `{current_user} does not have `{self.role}` permission on dataset {dataset_id}",
                )
        else:
            raise HTTPException(
                status_code=403,
                detail=f"User `{current_user} does not have `{self.role}` permission on dataset {dataset_id}",
            )


class FileAuthorization:
    """We use class dependency so that we can provide the `permission` parameter to the dependency.
    For more info see https://fastapi.tiangolo.com/advanced/advanced-dependencies/."""

    def __init__(self, role: str):
        self.role = role

    async def __call__(
        self,
        file_id: str,
        db: MongoClient = Depends(get_db),
        current_user: str = Depends(get_current_username),
    ):
        if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
            file_out = FileOut.from_mongo(file)
            authorization = await AuthorizationDB.find_one(
                AuthorizationDB.dataset_id == file_out.dataset_id,
                Or(
                    AuthorizationDB.creator == current_user,
                    AuthorizationDB.user_ids == current_user,
                ),
            )
            # if (
            #         authorization_q := await db["authorization"].find_one(
            #             {
            #                 "$and": [
            #                     {"dataset_id": ObjectId(file_out.dataset_id)},
            #                     {
            #                         "$or": [
            #                             {"creator": current_user},
            #                             {"user_ids": current_user},
            #                         ]
            #                     },
            #                 ]
            #             }
            #         )
            # ) is not None:
            #     authorization = AuthorizationDB.from_mongo(authorization_q)
            if authorization is not None:
                if access(authorization.role, self.role):
                    return True
                raise HTTPException(
                    status_code=403,
                    detail=f"User `{current_user} does not have `{self.role}` permission on file {file_id}",
                )
            else:
                raise HTTPException(status_code=404, detail=f"File {file_id} not found")


class MetadataAuthorization:
    """We use class dependency so that we can provide the `permission` parameter to the dependency.
    For more info see https://fastapi.tiangolo.com/advanced/advanced-dependencies/."""

    def __init__(self, role: str):
        self.role = role

    async def __call__(
        self,
        metadata_id: str,
        db: MongoClient = Depends(get_db),
        current_user: str = Depends(get_current_username),
    ):
        if (
            metadata := await db["metadata"].find_one({"_id": ObjectId(metadata_id)})
        ) is not None:
            md_out = MetadataOut.from_mongo(metadata)
            resource_type = md_out.resource.collection
            resource_id = md_out.resource.resource_id
            if resource_type == "files":
                if (
                    file := await db["files"].find_one({"_id": ObjectId(resource_id)})
                ) is not None:
                    file_out = FileOut.from_mongo(file)
                    authorization = await AuthorizationDB.find_one(
                        AuthorizationDB.dataset_id == file_out.dataset_id,
                        Or(
                            AuthorizationDB.creator == current_user,
                            AuthorizationDB.user_ids == current_user,
                        ),
                    )
                    # if (
                    #         authorization_q := await db["authorization"].find_one(
                    #             {
                    #                 "$and": [
                    #                     {"dataset_id": ObjectId(file_out.dataset_id)},
                    #                     {
                    #                         "$or": [
                    #                             {"creator": current_user},
                    #                             {"user_ids": current_user},
                    #                         ]
                    #                     },
                    #                 ]
                    #             }
                    #         )
                    # ) is not None:
                    #     authorization = AuthorizationDB.from_mongo(authorization_q)
                    if authorization is not None:
                        if access(authorization.role, self.role):
                            return True
                        raise HTTPException(
                            status_code=403,
                            detail=f"User `{current_user} does not have `{self.role}` permission on metadata {metadata_id}",
                        )
                    else:
                        raise HTTPException(
                            status_code=404, detail=f"Metadata {metadata_id} not found"
                        )
            elif resource_type == "datasets":
                if (
                    dataset := await db["datasets"].find_one(
                        {"_id": ObjectId(resource_id)}
                    )
                ) is not None:
                    dataset_out = DatasetOut.from_mongo(dataset)
                    authorization = await AuthorizationDB.find_one(
                        AuthorizationDB.dataset_id == dataset_out.dataset_id,
                        Or(
                            AuthorizationDB.creator == current_user,
                            AuthorizationDB.user_ids == current_user,
                        ),
                    )
                    # if (
                    #         authorization_q := await db["authorization"].find_one(
                    #             {
                    #                 "$and": [
                    #                     {"dataset_id": ObjectId(dataset_out.id)},
                    #                     {
                    #                         "$or": [
                    #                             {"creator": current_user},
                    #                             {"user_ids": current_user},
                    #                         ]
                    #                     },
                    #                 ]
                    #             }
                    #         )
                    # ) is not None:
                    #     authorization = AuthorizationDB.from_mongo(authorization_q)
                    if authorization is not None:
                        if access(authorization.role, self.role):
                            return True
                        raise HTTPException(
                            status_code=403,
                            detail=f"User `{current_user} does not have `{self.role}` permission on metadata {metadata_id}",
                        )
                    else:
                        raise HTTPException(
                            status_code=404, detail=f"Metadata {metadata_id} not found"
                        )


class GroupAuthorization:
    """For endpoints where someone is trying to modify a Group."""

    def __init__(self, role: str):
        self.role = role

    async def __call__(
        self,
        group_id: str,
        db: MongoClient = Depends(get_db),
        current_user: str = Depends(get_current_username),
    ):
        if (
            group_q := await db["groups"].find_one({"_id": ObjectId(group_id)})
        ) is not None:
            group = GroupOut.from_mongo(group_q)
            if group.creator == current_user:
                # Creator can do everything
                return True
            for u in group.users:
                if u.user.email == current_user:
                    if u.editor and self.role == RoleType.EDITOR:
                        return True
                    elif self.role == RoleType.VIEWER:
                        return True
            raise HTTPException(
                status_code=403,
                detail=f"User `{current_user} does not have `{self.role}` permission on group {group_id}",
            )
        raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


def access(user_role: RoleType, role_required: RoleType) -> bool:
    """Enforce implied role hierarchy OWNER > EDITOR > UPLOADER > VIEWER"""
    if user_role == RoleType.OWNER:
        return True
    elif user_role == RoleType.EDITOR and role_required in [
        RoleType.EDITOR,
        RoleType.UPLOADER,
        RoleType.VIEWER,
    ]:
        return True
    elif user_role == RoleType.UPLOADER and role_required in [
        RoleType.UPLOADER,
        RoleType.VIEWER,
    ]:
        return True
    elif user_role == RoleType.VIEWER and role_required == RoleType.VIEWER:
        return True
    else:
        return False
