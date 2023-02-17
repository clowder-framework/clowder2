from datetime import datetime
from http.client import HTTPException

from bson.objectid import ObjectId
from fastapi.params import Depends
from fastapi.routing import APIRouter
from pymongo.mongo_client import MongoClient

from app import keycloak_auth, dependencies
from app.models.groups import GroupOut, GroupIn, GroupDB, GroupBase
from app.models.users import UserOut
from app.routers.users import get_user

router = APIRouter()


@router.post("", response_model=GroupOut)
async def save_group(
    group_in: GroupIn,
    user=Depends(keycloak_auth.get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    # Check all connection and abort if any one of them is not available
    if db is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    # validate the group_in json payload
    if len(group_in.name) == 0 or len(group_in.userList) == 0:
        raise HTTPException(
            status_code=400,
            detail="Json payload is not in proper format. Either group name is null or user list has no user",
        )
        return

    group_db = GroupDB(**group_in.dict(), author=user)
    new_group = await db["groups"].insert_one(group_db.to_mongo())
    found = await db["groups"].find_one({"_id": new_group.inserted_id})
    group_out = GroupOut.from_mongo(found)
    return group_out


@router.get("/{group_id}", response_model=GroupOut)
async def get_group(group_id: str, db: MongoClient = Depends(dependencies.get_db)):
    # Check all connection and abort if any one of them is not available
    if db is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return
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
    # Check all connection and abort if any one of them is not available
    if db is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return
    if (group := await db["groups"].find_one({"_id": ObjectId(group_id)})) is not None:
        group_dict = dict(group_info) if group_info is not None else {}

        if len(group_dict.name) == 0 or len(group_dict.userList) == 0:
            raise HTTPException(
                status_code=400,
                detail="Group name can't be null or user list can't be empty",
            )
            return

        user = await db["users"].find_one({"email": user_id})
        group_dict["author"] = UserOut(**user)
        group_dict["modified"] = datetime.datetime.utcnow()
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
    # Check all connection and abort if any one of them is not available
    if db is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

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
