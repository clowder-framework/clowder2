from datetime import datetime
from typing import List, Optional

from beanie import PydanticObjectId
from beanie.operators import Or, Push, RegEx
from bson.objectid import ObjectId
from fastapi import HTTPException, Depends, APIRouter

from app.deps.authorization_deps import AuthorizationDB, GroupAuthorization
from app.keycloak_auth import get_current_user, get_user, get_admin_mode
from app.models.authorization import RoleType
from app.models.groups import GroupOut, GroupIn, GroupDB, GroupBase, Member
from app.models.users import UserOut, UserDB

router = APIRouter()


@router.post("", response_model=GroupOut)
async def save_group(
    group_in: GroupIn,
    user=Depends(get_current_user),
):
    group_db = GroupDB(**group_in.dict(), creator=user.email)
    user_member = Member(user=user, editor=True)
    if user_member not in group_db.users:
        group_db.users.append(user_member)
    await group_db.insert()
    return group_db.dict()


@router.get("", response_model=List[GroupOut])
async def get_groups(
    user_id=Depends(get_user),
    skip: int = 0,
    limit: int = 10,
):
    """Get a list of all Groups in the db the user is a member/owner of.

    Arguments:
        skip -- number of initial recoto_list()rds to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)


    """
    groups = await GroupDB.find(
        Or(
            GroupDB.creator == user_id,
            GroupDB.users.user.email == user_id,
        ),
        sort=(-GroupDB.created),
        skip=skip,
        limit=limit,
    ).to_list()
    return [group.dict() for group in groups]


@router.get("/search/{search_term}", response_model=List[GroupOut])
async def search_group(
    search_term: str,
    user_id=Depends(get_user),
    skip: int = 0,
    limit: int = 10,
):
    """Search all groups in the db based on text.

    Arguments:
        text -- any text matching name or description
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
    """

    # user has to be the creator or member first; then apply search
    groups = await GroupDB.find(
        Or(GroupDB.creator == user_id, GroupDB.users.user.email == user_id),
        Or(
            RegEx(field=GroupDB.name, pattern=search_term),
            RegEx(field=GroupDB.description, pattern=search_term),
        ),
        skip=skip,
        limit=limit,
    ).to_list()

    return [group.dict() for group in groups]


@router.get("/{group_id}", response_model=GroupOut)
async def get_group(
    group_id: str,
    admin_mode: bool = Depends(get_admin_mode),
    allow: bool = Depends(GroupAuthorization("viewer")),
):
    if (group := await GroupDB.get(PydanticObjectId(group_id))) is not None:
        return group.dict()
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.put("/{group_id}", response_model=GroupOut)
async def edit_group(
    group_id: str,
    group_info: GroupBase,
    admin_mode: bool = Depends(get_admin_mode),
    user_id=Depends(get_user),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    if (group := await GroupDB.get(PydanticObjectId(group_id))) is not None:
        group_dict = dict(group_info) if group_info is not None else {}

        if len(group_dict["name"]) == 0 or len(group_dict["users"]) == 0:
            raise HTTPException(
                status_code=400,
                detail="Group name can't be null or user list can't be empty",
            )
            return

        user = await UserDB.find_one(UserDB.email == user_id)
        group_dict["creator"] = user.dict()
        group_dict["modified"] = datetime.utcnow()
        groups_users = group_dict["users"]
        original_users = group.users

        # remove users that are no longer in this group
        for original_user in original_users:
            if original_user not in groups_users:
                # remove them from auth
                async for auth in AuthorizationDB.find(
                    {"group_ids": ObjectId(group_id)}
                ):
                    auth.user_ids.remove(original_user.user.email)
                    await auth.replace()
                    # Update group itself
                group.users.remove(original_user)
                await group.replace()
        # add new users to the group
        for i in range(0, len(groups_users)):
            user = groups_users[i]
            if user in group.users:
                for original_user in group.users:
                    if original_user.user.email == user.user.email:
                        original_editor = original_user.editor
                        new_editor = user.editor
                        # replace the user if editor has changed
                        if not new_editor == original_editor:
                            group.users.remove(original_user)
                            group.users.append(user)
                            await group.replace()
            else:
                # if user is not in the group add user
                group.users.append(user)
                await group.replace()
                # Add user to all affected Authorization entries
                await AuthorizationDB.find(
                    AuthorizationDB.group_ids == ObjectId(group_id),
                ).update(
                    Push({AuthorizationDB.user_ids: user.email}),
                )
        try:
            group.name = group_dict["name"]
            await group.replace()
            if "description" in group_dict:
                group.description = group_dict["description"]
                await group.replace()
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return group.dict()
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.delete("/{group_id}", response_model=GroupOut)
async def delete_group(
    group_id: str,
    admin_mode: bool = Depends(get_admin_mode),
    allow: bool = Depends(GroupAuthorization("owner")),
):
    if (group := await GroupDB.get(PydanticObjectId(group_id))) is not None:
        await group.delete()
        return group.dict()  # TODO: Do we need to return what we just deleted?
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {group_id} not found")


@router.post("/{group_id}/add/{username}", response_model=GroupOut)
async def add_member(
    group_id: str,
    username: str,
    admin_mode: bool = Depends(get_admin_mode),
    role: Optional[str] = None,
    allow: bool = Depends(GroupAuthorization("editor")),
):
    """Add a new user to a group."""
    if (user := await UserDB.find_one(UserDB.email == username)) is not None:
        new_member = Member(user=UserOut(**user.dict()))
        if (group := await GroupDB.get(PydanticObjectId(group_id))) is not None:
            found_already = False
            for u in group.users:
                if u.user.email == username:
                    found_already = True
                    break
            if not found_already:
                # If user is already in the group, skip directly to returning the group
                # else add role and attach this member

                if role is not None and role == RoleType.EDITOR:
                    new_member.editor = True
                else:
                    new_member.editor = False
                group.users.append(new_member)
                await group.replace()
                # Add user to all affected Authorization entries
                await AuthorizationDB.find(
                    AuthorizationDB.group_ids == ObjectId(group_id),
                ).update(
                    Push({AuthorizationDB.user_ids: username}),
                )
            return group.dict()
        raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    raise HTTPException(status_code=404, detail=f"User {username} not found")


@router.post("/{group_id}/remove/{username}", response_model=GroupOut)
async def remove_member(
    group_id: str,
    username: str,
    admin_mode: bool = Depends(get_admin_mode),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    """Remove a user from a group."""

    if (group := await GroupDB.get(PydanticObjectId(group_id))) is not None:
        # Is the user actually in the group already?
        found_user = None
        for u in group.users:
            if u.user.email == username:
                found_user = u
        if not found_user:
            # TODO: User wasn't in group, should this throw an error instead? Either way, the user is removed...
            return group

        # Remove user from all affected Authorization entries
        # TODO not sure if this is right
        async for auth in AuthorizationDB.find({"group_ids": ObjectId(group_id)}):
            auth.user_ids.remove(username)
            await auth.replace()

        # Update group itself
        group.users.remove(found_user)
        await group.replace()

        return group.dict()
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.put("/{group_id}/update/{username}", response_model=GroupOut)
async def update_member(
    group_id: str,
    username: str,
    role: str,
    admin_mode: bool = Depends(get_admin_mode),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    """Update user role."""
    if (user := await UserDB.find_one({"email": username})) is not None:
        if (group := await GroupDB.get(PydanticObjectId(group_id))) is not None:
            found_user = None
            found_user_index = -1
            for i, u in enumerate(group.users):
                if u.user.email == username:
                    found_user = u.user
                    found_user_index = i
                    break
            if found_user and found_user_index >= 0:
                if role == RoleType.EDITOR:
                    updated_member = Member(user=found_user, editor=True)
                else:
                    updated_member = Member(user=found_user, editor=False)
                group.users[found_user_index] = updated_member
                await group.replace()
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"User {username} does not belong to this group!",
                )
            return group.dict()
        raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    raise HTTPException(status_code=404, detail=f"User {username} not found")
