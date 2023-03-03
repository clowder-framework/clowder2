from fastapi import Depends, HTTPException
from pymongo import MongoClient
from bson import ObjectId

from app.dependencies import get_db
from app.keycloak_auth import get_current_username
from app.models.authorization import RoleType, AuthorizationDB
from app.models.files import FileOut


async def get_role(
    dataset_id: str,
    db: MongoClient = Depends(get_db),
    current_user=Depends(get_current_username),
) -> RoleType:
    authorization = await db["authorization"].find_one(
        {"dataset_id": ObjectId(dataset_id), "user_id": current_user}
    )
    role = AuthorizationDB.from_mongo(authorization).role
    return role


async def get_role_by_file(
    file_id: str,
    db: MongoClient = Depends(get_db),
    current_user=Depends(get_current_username),
) -> RoleType:
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        file_out = FileOut.from_mongo(file)
        authorization = await db["authorization"].find_one(
            {
                "dataset_id": ObjectId(file_out.dataset_id),
                "user_id": current_user,
                "creator": current_user,
            }
        )
        role = AuthorizationDB.from_mongo(authorization).role
        return role

    raise HTTPException(status_code=404, detail=f"File {file_id} not found")


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
            {
                "dataset_id": ObjectId(dataset_id),
                "user_id": current_user,
                "creator": current_user,
            }
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
