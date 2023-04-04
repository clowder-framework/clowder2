from datetime import datetime
from http.client import HTTPException
from bson.objectid import ObjectId
from fastapi.params import Depends
from fastapi.routing import APIRouter
from pymongo import DESCENDING
from pymongo.mongo_client import MongoClient
from typing import List, Optional

from app import dependencies
from app.deps.authorization_deps import AuthorizationDB, GroupAuthorization
from app.keycloak_auth import get_current_user, get_user
from app.models.authorization import RoleType
from app.models.groups import GroupOut, GroupIn, GroupDB, GroupBase, Member
from app.models.users import UserOut

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
    new_group = await db["groups"].insert_one(group_db.to_mongo())
    found = await db["groups"].find_one({"_id": new_group.inserted_id})
    group_out = GroupOut.from_mongo(found)
    return group_out


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

    groups = []
    for doc in (
        await db["groups"]
        .find(
            {
                "$or": [
                    {"creator": user_id},
                    {"users.user.email": user_id},
                ]
            }
        )
        .sort([("created", DESCENDING)])
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    ):
        groups.append(GroupOut.from_mongo(doc))
    return groups


@router.get("/{group_id}", response_model=GroupOut)
async def get_group(
    group_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(GroupAuthorization("viewer")),
):
    if (group := await db["groups"].find_one({"_id": ObjectId(group_id)})) is not None:
        return GroupOut.from_mongo(group)
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.put("/{group_id}", response_model=GroupOut)
async def edit_group(
    group_id: str,
    group_info: GroupBase,
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    if (group := await db["groups"].find_one({"_id": ObjectId(group_id)})) is not None:
        group_dict = dict(group_info) if group_info is not None else {}

        if len(group_dict.name) == 0 or len(group_dict.users) == 0:
            raise HTTPException(
                status_code=400,
                detail="Group name can't be null or user list can't be empty",
            )
            return

        user = await db["users"].find_one({"email": user_id})
        group_dict["author"] = UserOut(**user)
        group_dict["modified"] = datetime.datetime.utcnow()
        # TODO: Revisit this. Authorization needs to be updated here.
        group_dict["users"] = list(set(group_dict["users"]))
        try:
            group.update(group_dict)
            await db["groups"].replace_one(
                {"_id": ObjectId(group_id)}, GroupDB(**group).to_mongo()
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return GroupOut.from_mongo(group)
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.delete("/{group_id}")
async def delete_group(
    group_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(GroupAuthorization("owner")),
):
    if (group := await db["groups"].find_one({"_id": ObjectId(group_id)})) is not None:
        await db["groups"].delete_one({"_id": ObjectId(group_id)})
        return {"deleted": group_id}
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {group_id} not found")


@router.get("/search/{search_term}")
async def search_group(
    search_term: str, db: MongoClient = Depends(dependencies.get_db)
):
    # Check all connection and abort if any one of them is not available
    if db is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    groups = []
    pattern = ".*" + search_term + ".*"
    async for f in db["groups"].find({"name": {"$regex": pattern, "$options": "i"}}):
        groups.append(GroupDB.from_mongo(f))

    return groups


@router.post("/{group_id}/add/{username}")
async def add_member(
    group_id: str,
    username: str,
    role: Optional[str] = None,
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    """Add a new user to a group."""
    if (user_q := await db["users"].find_one({"email": username})) is not None:
        new_member = Member(user=UserOut.from_mongo(user_q))
        if (
            group_q := await db["groups"].find_one({"_id": ObjectId(group_id)})
        ) is not None:
            group = GroupDB.from_mongo(group_q)
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
                await db["groups"].replace_one(
                    {"_id": ObjectId(group_id)}, group.to_mongo()
                )
                # Add user to all affected Authorization entries
                await db["authorization"].update_many(
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

    if (
        group_q := await db["groups"].find_one({"_id": ObjectId(group_id)})
    ) is not None:
        group = GroupDB.from_mongo(group_q)

        # Is the user actually in the group already?
        found_user = None
        for u in group.users:
            if u.user.email == username:
                found_user = u
        if not found_user:
            # TODO: User wasn't in group, should this throw an error instead? Either way, the user is removed...
            return group

        # Remove user from all affected Authorization entries
        async for auth_q in db["authorization"].find({"group_ids": ObjectId(group_id)}):
            auth = AuthorizationDB.from_mongo(auth_q)
            auth.user_ids.remove(username)
            await db["authorization"].replace_one({"_id": auth.id}, auth.to_mongo())

        # Update group itself
        group.users.remove(found_user)
        await db["groups"].replace_one({"_id": ObjectId(group_id)}, group.to_mongo())

        return group
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.put("/{group_id}/update/{username}", response_model=RoleType)
async def update_member(
    group_id: str,
    username: str,
    role: str,
    db: MongoClient = Depends(dependencies.get_db),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    """Update user role."""
    if (user_q := await db["users"].find_one({"email": username})) is not None:
        if (
            group_q := await db["groups"].find_one({"_id": ObjectId(group_id)})
        ) is not None:
            group = GroupDB.from_mongo(group_q)
            found_user = None
            for i, u in enumerate(group.users):
                if u.user.email == username:
                    found_user = u.user
                    found_user_index = i
                    break
            if found_user and found_user_index:
                if role == RoleType.EDITOR:
                    found_user.editor = True
                else:
                    found_user.editor = False
                group.users[found_user_index] = found_user
                await db["groups"].replace_one(
                    {"_id": ObjectId(group_id)}, group.to_mongo()
                )
            else:
                raise HTTPException(status_code=404, detail=f"User {username} does not belong to this group!")
            return group
        raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    raise HTTPException(status_code=404, detail=f"User {username} not found")
