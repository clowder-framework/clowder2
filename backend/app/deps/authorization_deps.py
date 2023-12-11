from beanie import PydanticObjectId
from beanie.operators import Or
from fastapi import Depends, HTTPException

from app.keycloak_auth import get_current_username, get_admin_mode
from app.models.authorization import RoleType, AuthorizationDB
from app.models.datasets import DatasetDB, DatasetStatus
from app.models.files import FileDB
from app.models.groups import GroupDB
from app.models.metadata import MetadataDB
from app.models.pyobjectid import PyObjectId
from app.routers.authentication import get_admin


async def get_role(
        dataset_id: str,
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


async def get_role_by_file(
        file_id: str,
        current_user=Depends(get_current_username),
) -> RoleType:
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        authorization = await AuthorizationDB.find_one(
            AuthorizationDB.dataset_id == file.dataset_id,
            Or(
                AuthorizationDB.creator == current_user,
                AuthorizationDB.user_ids == current_user,
            ),
        )
        if authorization is None:
            if (
                    dataset := await DatasetDB.get(PydanticObjectId(file.dataset_id))
            ) is not None:
                if dataset.status == DatasetStatus.AUTHENTICATED.name:
                    auth_dict = {
                        "creator": dataset.author.email,
                        "dataset_id": file.dataset_id,
                        "user_ids": [current_user],
                        "role": RoleType.VIEWER,
                    }
                    authenticated_auth = AuthorizationDB(**auth_dict)
                    return authenticated_auth
                else:
                    raise HTTPException(
                        status_code=403,
                        detail=f"User `{current_user} does not have role on file {file_id}",
                    )
        return authorization.role
    raise HTTPException(status_code=404, detail=f"File {file_id} not found")


async def get_role_by_metadata(
        metadata_id: str,
        current_user=Depends(get_current_username),
) -> RoleType:
    if (md_out := await MetadataDB.get(PydanticObjectId(metadata_id))) is not None:
        resource_type = md_out.resource.collection
        resource_id = md_out.resource.resource_id
        if resource_type == "files":
            if (file := await FileDB.get(PydanticObjectId(resource_id))) is not None:
                authorization = await AuthorizationDB.find_one(
                    AuthorizationDB.dataset_id == file.dataset_id,
                    Or(
                        AuthorizationDB.creator == current_user,
                        AuthorizationDB.user_ids == current_user,
                    ),
                )
                return authorization.role
        elif resource_type == "datasets":
            if (
                    dataset := await DatasetDB.get(PydanticObjectId(resource_id))
            ) is not None:
                authorization = await AuthorizationDB.find_one(
                    AuthorizationDB.dataset_id == dataset.id,
                    Or(
                        AuthorizationDB.creator == current_user,
                        AuthorizationDB.user_ids == current_user,
                    ),
                )
                return authorization.role


async def get_role_by_group(
        group_id: str,
        current_user=Depends(get_current_username),
) -> RoleType:
    if (group := await GroupDB.get(group_id)) is not None:
        if group.creator == current_user:
            # Creator can do everything
            return RoleType.OWNER
        for u in group.users:
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


async def is_public_dataset(
        dataset_id: str,
) -> bool:
    """Checks if a dataset is public."""
    if (dataset_out := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if dataset_out.status == DatasetStatus.PUBLIC:
            return True
    else:
        return False


async def is_authenticated_dataset(
        dataset_id: str,
) -> bool:
    """Checks if a dataset is authenticated."""
    if (dataset_out := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if dataset_out.status == DatasetStatus.AUTHENTICATED:
            return True
    else:
        return False


class Authorization:
    """We use class dependency so that we can provide the `permission` parameter to the dependency.
    For more info see https://fastapi.tiangolo.com/advanced/advanced-dependencies/."""

    def __init__(self, role: str):
        self.role = role

    async def __call__(
            self,
            dataset_id: str,
            admin_mode: bool = Depends(get_admin_mode),
            current_user: str = Depends(get_current_username),
            admin: bool = Depends(get_admin),
    ):
        # TODO: Make sure we enforce only one role per user per dataset, or find_one could yield wrong answer here.

        # If the current user is admin and has turned on admin_mode, user has access irrespective of any role assigned
        if admin and admin_mode:
            return True

        # Else check role assigned to the user
        authorization = await AuthorizationDB.find_one(
            AuthorizationDB.dataset_id == PyObjectId(dataset_id),
            Or(
                AuthorizationDB.creator == current_user,
                AuthorizationDB.user_ids == current_user,
            ),
        )
        if authorization is not None:
            if access(authorization.role, self.role):
                return True
            else:
                raise HTTPException(
                    status_code=403,
                    detail=f"User `{current_user} does not have `{self.role}` permission on dataset {dataset_id}",
                )
        else:
            if (
                    current_dataset := await DatasetDB.get(PydanticObjectId(dataset_id))
            ) is not None:
                if (
                        current_dataset.status == DatasetStatus.AUTHENTICATED.name
                        and self.role == "viewer"
                ):
                    return True
                else:
                    raise HTTPException(
                        status_code=403,
                        detail=f"User `{current_user} does not have `{self.role}` permission on dataset {dataset_id}",
                    )
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"The dataset {dataset_id} is not found",
                )


class FileAuthorization:
    """We use class dependency so that we can provide the `permission` parameter to the dependency.
    For more info see https://fastapi.tiangolo.com/advanced/advanced-dependencies/."""

    def __init__(self, role: str):
        self.role = role

    async def __call__(
            self,
            file_id: str,
            admin_mode: bool = Depends(get_admin_mode),
            current_user: str = Depends(get_current_username),
            admin: bool = Depends(get_admin),
    ):
        # If the current user is admin and has turned on admin_mode, user has access irrespective of any role assigned
        if admin and admin_mode:
            return True

        # Else check role assigned to the user
        if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
            authorization = await AuthorizationDB.find_one(
                AuthorizationDB.dataset_id == file.dataset_id,
                Or(
                    AuthorizationDB.creator == current_user,
                    AuthorizationDB.user_ids == current_user,
                ),
            )
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
            admin_mode: bool = Depends(get_admin_mode),
            current_user: str = Depends(get_current_username),
            admin: bool = Depends(get_admin),
    ):
        # If the current user is admin and has turned on admin_mode, user has access irrespective of any role assigned
        if admin and admin_mode:
            return True

        # Else check role assigned to the user
        if (md_out := await MetadataDB.get(PydanticObjectId(metadata_id))) is not None:
            resource_type = md_out.resource.collection
            resource_id = md_out.resource.resource_id
            if resource_type == "files":
                if (
                        file := await FileDB.get(PydanticObjectId(resource_id))
                ) is not None:
                    authorization = await AuthorizationDB.find_one(
                        AuthorizationDB.dataset_id == file.dataset_id,
                        Or(
                            AuthorizationDB.creator == current_user,
                            AuthorizationDB.user_ids == current_user,
                        ),
                    )
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
                        dataset := await DatasetDB.get(PydanticObjectId(resource_id))
                ) is not None:
                    authorization = await AuthorizationDB.find_one(
                        AuthorizationDB.dataset_id == dataset.id,
                        Or(
                            AuthorizationDB.creator == current_user,
                            AuthorizationDB.user_ids == current_user,
                        ),
                    )
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
            admin_mode: bool = Depends(get_admin_mode),
            current_user: str = Depends(get_current_username),
            admin: bool = Depends(get_admin),
    ):
        # If the current user is admin and has turned on admin_mode, user has access irrespective of any role assigned
        if admin and admin_mode:
            return True

        # Else check role assigned to the user
        if (group := await GroupDB.get(group_id)) is not None:
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


class CheckStatus:
    """We use class dependency so that we can provide the `permission` parameter to the dependency.
    For more info see https://fastapi.tiangolo.com/advanced/advanced-dependencies/."""

    def __init__(self, status: str):
        self.status = status

    async def __call__(
            self,
            dataset_id: str,
    ):
        if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
            if dataset.status == self.status:
                return True
            else:
                return False
        else:
            return False


class CheckFileStatus:
    """We use class dependency so that we can provide the `permission` parameter to the dependency.
    For more info see https://fastapi.tiangolo.com/advanced/advanced-dependencies/."""

    def __init__(self, status: str):
        self.status = status

    async def __call__(
            self,
            file_id: str,
    ):
        if (file_out := await FileDB.get(PydanticObjectId(file_id))) is not None:
            dataset_id = file_out.dataset_id
            if (
                    dataset := await DatasetDB.get(PydanticObjectId(dataset_id))
            ) is not None:
                if dataset.status == self.status:
                    return True
                else:
                    return False
            else:
                return False
        else:
            return False


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
