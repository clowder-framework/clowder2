from datetime import datetime
from http.client import HTTPException

from bson.objectid import ObjectId
from fastapi.params import Depends
from fastapi.routing import APIRouter
from pymongo.mongo_client import MongoClient

from app import dependencies
from app.keycloak_auth import get_current_user
from app.models.groups import GroupOut, GroupIn, GroupDB, GroupBase, Member
from app.models.users import UserOut
from app.routers.users import get_user

router = APIRouter()


@router.post("", response_model=GroupOut)
async def save_group(
    group_in: GroupIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    group_db = GroupDB(**group_in.dict(), creator=user)
    user_member = Member(user=user, is_owner=True)
    if user_member not in group_db.users:
        group_db.users.append(user_member)
    new_group = await db["groups"].insert_one(group_db.to_mongo())
    found = await db["groups"].find_one({"_id": new_group.inserted_id})
    group_out = GroupOut.from_mongo(found)
    return group_out


@router.get("/{group_id}", response_model=GroupOut)
async def get_group(group_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (group := await db["groups"].find_one({"_id": ObjectId(group_id)})) is not None:
        return GroupOut.from_mongo(group)
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.post("/{group_id}", response_model=GroupOut)
async def edit_group(
    group_id: str,
    group_info: GroupBase,
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
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
async def delete_group(group_id: str, db: MongoClient = Depends(dependencies.get_db)):
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


@router.patch("/{group_id}/add/{username}")
async def add_member(
    group_id: str,
    username: str,
    user=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    if (user_q := await db["users"].find_one({"email": username})) is not None:
        new_member = Member(user=UserOut.from_mongo(user_q))
        if (
            group_q := await db["groups"].find_one({"_id": ObjectId(group_id)})
        ) is not None:
            group = GroupDB.from_mongo(**group_q)
            found_already = False
            permission = False
            for u in group.users:
                if u.user.email == username:
                    found_already = True
                if u.user.email == user.email and u.isOwner:
                    # TODO: Add GroupAuthorization dependency instead of checking ownership here
                    permission = True
            if permission:
                if not found_already:
                    group.users.append(new_member)
                    await db["groups"].replace_one(
                        {"_id": ObjectId(group_id)}, group.to_mongo()
                    )
                    # TODO: Add user to all affected Authorization entries

                return group
            else:
                raise HTTPException(status_code=403, detail=f"You do not have permission to modify group {group_id}")
        raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
    raise HTTPException(status_code=404, detail=f"User {username} not found")


@router.patch("/{group_id}/remove/{username}")
async def remove_member(
    group_id: str,
    username: str,
    user=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    if (
            group_q := await db["groups"].find_one({"_id": ObjectId(group_id)})
    ) is not None:
        group = GroupDB.from_mongo(**group_q)

        # Figure out what kind of user we're removing
        found_owner = False
        found_member = False
        member = None
        for u in group.users:
            if u.user.email == username:
                if u.isOwner:
                    found_owner = True
                    member = u
                else:
                    found_member = True
                    member = u
        if not found_owner and not found_member:
            # TODO: Should this throw an error instead? Either way, the user is removed in the end...
            return group

        # Check if we have permission to remove them - creator can remove owners, owners can remove other members
        permission = False
        if found_owner and group.creator == user.email:
            permission = True
        elif found_member:
            for u in group.users:
                if u.user.email == user.email and u.isOwner:
                    permission = True
                    break
        if permission:
            # TODO: Remove user from all affected Authorization entries

            group.users.pop(member)
            await db["groups"].replace_one(
                {"_id": ObjectId(group_id)}, group.to_mongo()
            )
            return group
        else:
            raise HTTPException(status_code=403, detail=f"You do not have permission to modify group {group_id}")
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
