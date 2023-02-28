from bson import ObjectId
from fastapi import Depends, HTTPException
from pymongo import MongoClient

from app.dependencies import get_db
from app.keycloak_auth import get_current_username
from app.models.authorization import RoleType, AuthorizationDB
from app.models.files import FileOut
from app.models.datasets import DatasetOut
from app.models.metadata import MetadataOut


async def get_role(
    dataset_id: str,
    db: MongoClient = Depends(get_db),
    current_user=Depends(get_current_username),
) -> RoleType:
    authorization = await db["authorization"].find_one(
        {"dataset_id": dataset_id, "user_id": current_user, "creator": current_user}
    )
    role = AuthorizationDB.from_mongo(authorization).role
    return role


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
                authorization = await db["authorization"].find_one(
                    {
                        "dataset_id": file_out.dataset_id,
                        "user_id": current_user,
                        "creator": current_user,
                    }
                )
                role = AuthorizationDB.from_mongo(authorization).role
                return role
        elif resource_type == "datasets":
            if (
                dataset := await db["datasets"].find_one({"_id": ObjectId(resource_id)})
            ) is not None:
                dataset_out = DatasetOut.from_mongo(dataset)
                authorization = await db["authorization"].find_one(
                    {
                        "dataset_id": dataset_out.dataset_id,
                        "user_id": current_user,
                        "creator": current_user,
                    }
                )
                role = AuthorizationDB.from_mongo(authorization).role
                return role


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
        authorization = await db["authorization"].find_one(
            {"dataset_id": dataset_id, "user_id": current_user, "creator": current_user}
        )
        role = AuthorizationDB.from_mongo(authorization).role
        if access(role, self.role):
            return True
        else:
            raise HTTPException(
                status_code=403,
                detail=f"User `{current_user} does not have `{self.role}` permission on dataset {dataset_id}",
            )


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
