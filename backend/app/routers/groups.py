import re
from datetime import datetime
from fastapi import HTTPException, Depends, APIRouter
from bson.objectid import ObjectId
from pymongo import DESCENDING
from pymongo.mongo_client import MongoClient
from typing import List, Optional
from beanie import Document, View, PydanticObjectId

from app import dependencies
from app.deps.authorization_deps import AuthorizationDB, GroupAuthorization
from app.keycloak_auth import get_current_user, get_user
from app.models.authorization import RoleType
from app.models.groups import GroupOut, GroupIn, GroupDB, GroupBase, Member
from app.models.users import UserOut, UserDB

router = APIRouter()


@router.post("", response_model=GroupOut)
async def save_group(
    group_in: GroupIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    group_db = GroupDB(**group_in.dict(), creator=user.email)
    user_member = Member(user=user, editor=True)
    if user_member not in group_db.users:
        group_db.users.append(user_member)
    new_group = await GroupDB.insert_one(group_db)
    return GroupOut(**new_group.dict())


@router.get("", response_model=List[GroupOut])
async def get_groups(
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 10,
):
    """Get a list of all Groups in the db the user is a member/owner of.

    Arguments:
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)


    """
    return await GroupDB.find(
        {
            "$or": [
                {"creator": user_id},
                {"users.user.email": user_id},
            ]
        },
        sort=("created", DESCENDING),
        skip=skip,
        limit=limit,
    ).to_list()


@router.get("/search/{search_term}", response_model=List[GroupOut])
async def search_group(
    search_term: str,
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 10,
):
    """Search all groups in the db based on text.

    Arguments:
        text -- any text matching name or description
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
    """

    # Check all connection and abort if any one of them is not available
    if db is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    groups = []
    query_regx = re.compile(search_term, re.IGNORECASE)
    # user has to be the creator or member first; then apply search
    return await GroupDB.find(
        {
            "$and": [
                {"$or": [{"creator": user_id}, {"users.user.email": user_id}]},
                {"$or": [{"name": query_regx}, {"description": query_regx}]},
            ]
        },
        skip=skip,
        limit=limit,
    ).to_list(length=limit)


@router.get("/{group_id}", response_model=GroupOut)
async def get_group(
    group_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(GroupAuthorization("viewer")),
):
    group = await GroupDB.find_one(GroupDB.id == PydanticObjectId(group_id))
    if group is not None:
        return GroupOut(**group.dict())
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.put("/{group_id}", response_model=GroupOut)
async def edit_group(
    group_id: str,
    group_info: GroupBase,
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    group = await GroupDB.find(GroupDB.id == PydanticObjectId(group_id))
    if group is not None:
        group_dict = dict(group_info) if group_info is not None else {}

        if len(group_dict.name) == 0 or len(group_dict.users) == 0:
            raise HTTPException(
                status_code=400,
                detail="Group name can't be null or user list can't be empty",
            )
            return

        user = await UserDB.find(UserDB.email == user_id)
        group_dict["author"] = UserOut(**user)
        group_dict["modified"] = datetime.datetime.utcnow()
        # TODO: Revisit this. Authorization needs to be updated here.
        group_dict["users"] = list(set(group_dict["users"]))
        try:
            group.update(group_dict)
            await GroupDB.replace_one({"_id": ObjectId(group_id)}, GroupDB(group))
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return GroupOut(**group.dict())
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.delete("/{group_id}", response_model=GroupOut)
async def delete_group(
    group_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(GroupAuthorization("owner")),
):
    group_q = await GroupDB.find(GroupDB.id == PydanticObjectId(group_id))
    if group_q is not None:
        await GroupDB.delete_one(group_id)
        return GroupOut(**group_q.dict())
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {group_id} not found")


@router.post("/{group_id}/add/{username}", response_model=GroupOut)
async def add_member(
    group_id: str,
    username: str,
    role: Optional[str] = None,
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    """Add a new user to a group."""
    user_q = await UserDB.find_one(UserDB.email == username)
    if user_q is not None:
        user_out = UserOut(**user_q.dict())
        new_member = Member(user=user_out)
        group_q = await GroupDB.find_one(GroupDB.id == PydanticObjectId(group_id))
        if group_q is not None:
            group = GroupDB(**group_q.dict())
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
                # TODO this does not work
                await AuthorizationDB.update_all(
                    {"group_ids": ObjectId(group_id)}, {"$push": {"user_ids": username}}
                )
            return group
        raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    raise HTTPException(status_code=404, detail=f"User {username} not found")


@router.post("/{group_id}/remove/{username}")
async def remove_member(
    group_id: str,
    username: str,
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    """Remove a user from a group."""

    group_q = await GroupDB.find_one(GroupDB.id == PydanticObjectId(group_id))
    if group_q is not None:
        group = GroupDB(**group_q.dict())

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
            await AuthorizationDB.replace({"_id": auth.id}, auth)

        # Update group itself
        group.users.remove(found_user)
        await group.replace()

        return group
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.put("/{group_id}/update/{username}", response_model=GroupOut)
async def update_member(
    group_id: str,
    username: str,
    role: str,
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    """Update user role."""
    if (user_q := await UserDB.find_one({"email": username})) is not None:
        group_q = await GroupDB.find(GroupDB.id == PydanticObjectId(group_id))
        if group_q is not None:
            group = GroupDB(**group_q.dict())
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
            return group
        raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    raise HTTPException(status_code=404, detail=f"User {username} not found")
