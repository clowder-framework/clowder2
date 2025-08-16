from app.dependencies import get_elasticsearchclient
from app.deps.authorization_deps import (
    Authorization,
    get_role_by_file,
    get_role_by_group,
    get_role_by_metadata,
)
from app.keycloak_auth import get_current_username, get_user
from app.models.authorization import (
    AuthorizationBase,
    AuthorizationDB,
    AuthorizationMetadata,
    AuthorizationOut,
    RoleType,
)
from app.models.datasets import (
    DatasetDBViewList,
    DatasetOut,
    DatasetRoles,
    DatasetStatus,
    GroupAndRole,
    UserAndRole,
)
from app.models.groups import GroupDB
from app.models.users import UserDB
from app.routers.authentication import get_admin, get_admin_mode
from app.search.index import index_dataset, index_dataset_files
from beanie import PydanticObjectId
from beanie.operators import In, Or
from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException

router = APIRouter()


@router.post("/datasets/{dataset_id}", response_model=AuthorizationOut)
async def save_authorization(
    dataset_id: str,
    authorization_in: AuthorizationBase,
    user=Depends(get_current_username),
    es=Depends(get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    """Save authorization info in Mongo. This is a triple of dataset_id/user_id/role/group_id."""

    # Retrieve users from groups in mongo
    user_ids = authorization_in.user_ids
    missing_groups = authorization_in.group_ids
    found_groups = 0
    async for group in GroupDB.find(In(GroupDB.id, authorization_in.group_ids)):
        found_groups += 1
        missing_groups.remove(group.id)
        for u in group.users:
            user_ids.append(u.user.email)
    if found_groups != len(authorization_in.group_ids):
        raise HTTPException(
            status_code=404, detail=f"Groups not found: {missing_groups}"
        )

    authorization = AuthorizationDB(
        **authorization_in.dict(), creator=user, user_ids=user_ids
    )
    await authorization.insert()
    await index_dataset_files(es, dataset_id, update=True)
    return authorization.dict()


@router.get("/datasets/{dataset_id}/role", response_model=AuthorizationOut)
async def get_dataset_role(
    dataset_id: str,
    current_user=Depends(get_current_username),
    enable_admin: bool = False,
    admin_mode: bool = Depends(get_admin_mode),
    admin=Depends(get_admin),
):
    """Retrieve role of user for a specific dataset."""
    # Get group id and the associated users from authorization
    criteria = []
    if not admin or not admin_mode:
        criteria.append(
            Or(
                AuthorizationDB.creator == current_user,
                AuthorizationDB.user_ids == current_user,
            )
        )

    auth_db = await AuthorizationDB.find_one(
        AuthorizationDB.dataset_id == PydanticObjectId(dataset_id),
        *criteria,
    )
    if auth_db is None:
        if (
            current_dataset := await DatasetDBViewList.find_one(
                DatasetDBViewList.id == PydanticObjectId(dataset_id)
            )
        ) is not None:
            if (
                current_dataset.status == DatasetStatus.AUTHENTICATED.name
                or current_dataset.status == DatasetStatus.PUBLIC.name
            ):
                public_authorization_in = {
                    "dataset_id": PydanticObjectId(dataset_id),
                    "role": RoleType.VIEWER,
                }
                authorization = AuthorizationDB(
                    **public_authorization_in, creator=current_dataset.creator.email
                )
                return authorization.dict()
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"No authorization found for dataset: {dataset_id}",
                )
    else:
        return auth_db.dict()


@router.get("/datasets/{dataset_id}/role/viewer}")
async def get_dataset_role_viewer(
    dataset_id: str,
    allow: bool = Depends(Authorization("viewer")),
):
    """Used for testing only. Returns true if user has viewer permission on dataset, otherwise throws a 403 Forbidden HTTP exception.
    See `routers/authorization.py` for more info."""
    return {"dataset_id": dataset_id, "allow": allow}


@router.get("/datasets/{dataset_id}/role/owner}")
async def get_dataset_role_owner(
    dataset_id: str,
    allow: bool = Depends(Authorization("owner")),
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


@router.get("/metadata/{metadata_id}/role}", response_model=AuthorizationMetadata)
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
    if (user := await UserDB.find_one(UserDB.email == current_user)) is not None:
        # return viewer if read only user
        if user.read_only_user:
            return RoleType.VIEWER
        else:
            return role


@router.post(
    "/datasets/{dataset_id}/group_role/{group_id}/{role}",
    response_model=AuthorizationOut,
)
async def set_dataset_group_role(
    dataset_id: PydanticObjectId,
    group_id: PydanticObjectId,
    role: RoleType,
    es=Depends(get_elasticsearchclient),
    user_id=Depends(get_user),
    allow: bool = Depends(Authorization("editor")),
):
    """Assign an entire group a specific role for a dataset."""
    if (
        dataset := await DatasetDBViewList.find_one(DatasetDBViewList.id == dataset_id)
    ) is not None:
        if (group := await GroupDB.get(group_id)) is not None:
            # First, remove any existing role the group has on the dataset
            await remove_dataset_group_role(dataset_id, group_id, es, user_id, allow)
            if (
                auth_db := await AuthorizationDB.find_one(
                    AuthorizationDB.dataset_id == PydanticObjectId(dataset_id),
                    AuthorizationDB.role == role,
                )
            ) is not None:
                if group_id not in auth_db.group_ids:
                    auth_db.group_ids.append(group_id)
                    readonly_user_ids = []
                    for u in group.users:
                        if u.user.read_only_user:
                            readonly_user_ids.append(u.user.email)
                        else:
                            auth_db.user_ids.append(u.user.email)
                    await auth_db.replace()
                    await index_dataset(
                        es, DatasetOut(**dataset.dict()), auth_db.user_ids, update=True
                    )
                    await index_dataset_files(es, str(dataset_id), update=True)
                    if len(readonly_user_ids) > 0:
                        readonly_auth_db = AuthorizationDB(
                            creator=user_id,
                            dataset_id=PydanticObjectId(dataset_id),
                            role=RoleType.VIEWER,
                            group_ids=[PydanticObjectId(group_id)],
                            user_ids=readonly_user_ids,
                        )
                        await readonly_auth_db.insert()
                        await index_dataset(
                            es,
                            DatasetOut(**dataset.dict()),
                            readonly_auth_db.user_ids,
                            update=True,
                        )
                        await index_dataset_files(es, str(dataset_id), update=True)
                return auth_db.dict()
            else:
                # Create new role entry for this dataset
                user_ids = []
                readonly_user_ids = []
                for u in group.users:
                    if u.user.read_only_user:
                        readonly_user_ids.append(u.user.email)
                    else:
                        user_ids.append(u.user.email)
                # add the users who get the role
                if len(readonly_user_ids) > 0:
                    readonly_auth_db = AuthorizationDB(
                        creator=user_id,
                        dataset_id=PydanticObjectId(dataset_id),
                        role=RoleType.VIEWER,
                        group_ids=[PydanticObjectId(group_id)],
                        user_ids=readonly_user_ids,
                    )
                    await readonly_auth_db.insert()
                    await index_dataset(
                        es,
                        DatasetOut(**dataset.dict()),
                        readonly_auth_db.user_ids,
                        update=True,
                    )
                    await index_dataset_files(es, str(dataset_id), update=True)
                if len(user_ids) > 0:
                    auth_db = AuthorizationDB(
                        creator=user_id,
                        dataset_id=PydanticObjectId(dataset_id),
                        role=role,
                        group_ids=[PydanticObjectId(group_id)],
                        user_ids=user_ids,
                    )
                    # if there are read only users add them with the role of viewer
                    await auth_db.insert()
                    await index_dataset(
                        es, DatasetOut(**dataset.dict()), auth_db.user_ids, update=True
                    )
                    await index_dataset_files(es, str(dataset_id), update=True)
                return auth_db.dict()
        else:
            raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post(
    "/datasets/{dataset_id}/user_role/{username}/{role}",
    response_model=AuthorizationOut,
)
async def set_dataset_user_role(
    dataset_id: str,
    username: str,
    role: RoleType,
    es=Depends(get_elasticsearchclient),
    user_id=Depends(get_user),
    allow: bool = Depends(Authorization("editor")),
):
    """Assign a single user a specific role for a dataset."""

    if (
        dataset := await DatasetDBViewList.find_one(
            DatasetDBViewList.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        if (user := await UserDB.find_one(UserDB.email == username)) is not None:
            # First, remove any existing role the user has on the dataset
            await remove_dataset_user_role(dataset_id, username, es, user_id, allow)
            auth_db = await AuthorizationDB.find_one(
                AuthorizationDB.dataset_id == PydanticObjectId(dataset_id),
                AuthorizationDB.role == role,
            )
            if user.read_only_user and role.name is not RoleType.VIEWER.name:
                raise HTTPException(
                    status_code=405, detail=f"User {username} is read only"
                )
            if auth_db is not None and username not in auth_db.user_ids:
                auth_db.user_ids.append(username)
                await auth_db.save()
                if username in auth_db.user_ids:
                    # Only add user entry if all the others occurrences are from associated groups
                    group_occurrences = 0
                    async for group in GroupDB.find(In(GroupDB.id, auth_db.group_ids)):
                        for u in group.users:
                            if u.user.email == username:
                                group_occurrences += 1
                    if auth_db.user_ids.count(username) == group_occurrences:
                        auth_db.user_ids.append(username)
                        await auth_db.save()
                else:
                    auth_db.user_ids.append(username)
                    await auth_db.save()
                await index_dataset(
                    es, DatasetOut(**dataset.dict()), auth_db.user_ids, update=True
                )
                await index_dataset_files(es, dataset_id, update=True)
                return auth_db.dict()
            else:
                # Create a new entry
                auth_db = AuthorizationDB(
                    creator=user_id,
                    dataset_id=PydanticObjectId(dataset_id),
                    role=role,
                    user_ids=[username],
                )
                await auth_db.insert()
                await index_dataset(
                    es, DatasetOut(**dataset.dict()), [username], update=True
                )
                await index_dataset_files(es, dataset_id, update=True)
                return auth_db.dict()
        else:
            raise HTTPException(status_code=404, detail=f"User {username} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.delete(
    "/datasets/{dataset_id}/group_role/{group_id}",
    response_model=AuthorizationOut,
)
async def remove_dataset_group_role(
    dataset_id: PydanticObjectId,
    group_id: PydanticObjectId,
    es=Depends(get_elasticsearchclient),
    user_id=Depends(get_user),
    allow: bool = Depends(Authorization("editor")),
):
    """Remove any role the group has with a specific dataset."""

    if (
        dataset := await DatasetDBViewList.find_one(DatasetDBViewList.id == dataset_id)
    ) is not None:
        if (group := await GroupDB.get(group_id)) is not None:
            if (
                auth_db := await AuthorizationDB.find_one(
                    AuthorizationDB.dataset_id == dataset_id,
                    AuthorizationDB.group_ids == group_id,
                )
            ) is not None:
                auth_db.group_ids.remove(PydanticObjectId(group_id))
                for u in group.users:
                    if u.user.email in auth_db.user_ids:
                        auth_db.user_ids.remove(u.user.email)
                await auth_db.save()
                # Update elasticsearch index with new users
                await index_dataset(
                    es, DatasetOut(**dataset.dict()), auth_db.user_ids, update=True
                )
                await index_dataset_files(es, str(dataset_id), update=True)
                return auth_db.dict()
        else:
            raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.delete(
    "/datasets/{dataset_id}/user_role/{username}",
    response_model=AuthorizationOut,
)
async def remove_dataset_user_role(
    dataset_id: str,
    username: str,
    es=Depends(get_elasticsearchclient),
    user_id=Depends(get_user),
    allow: bool = Depends(Authorization("editor")),
):
    """Remove any role the user has with a specific dataset."""

    if (
        dataset := await DatasetDBViewList.find_one(
            DatasetDBViewList.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        if (await UserDB.find_one(UserDB.email == username)) is not None:
            if (
                auth_db := await AuthorizationDB.find_one(
                    AuthorizationDB.dataset_id == PydanticObjectId(dataset_id),
                    AuthorizationDB.user_ids == username,
                )
            ) is not None:
                auth_db.user_ids.remove(username)
                await auth_db.save()
                # Update elasticsearch index with updated users
                await index_dataset(
                    es, DatasetOut(**dataset.dict()), auth_db.user_ids, update=True
                )
                await index_dataset_files(es, dataset_id, update=True)
                return auth_db.dict()
        else:
            raise HTTPException(status_code=404, detail=f"User {username} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/datasets/{dataset_id}/roles", response_model=DatasetRoles)
async def get_dataset_roles(
    dataset_id: str,
    allow: bool = Depends(Authorization("editor")),
):
    """Get a list of all users and groups that have assigned roles on this dataset."""
    if (
        dataset := await DatasetDBViewList.find_one(
            DatasetDBViewList.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        roles = DatasetRoles(dataset_id=str(dataset.id))

        async for auth in AuthorizationDB.find(
            AuthorizationDB.dataset_id == PydanticObjectId(dataset_id)
        ):
            # First, fetch all groups that have a role on the dataset
            group_user_counts = {}
            async for group in GroupDB.find(In(GroupDB.id, auth.group_ids)):
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
            async for user in UserDB.find(In(UserDB.email, auth.user_ids)):
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
