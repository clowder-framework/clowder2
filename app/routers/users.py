import json
from typing import List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from pymongo import MongoClient
from starlette import status

from app import dependencies
from app.config import settings
from app.keycloak import create_user
from keycloak.exceptions import KeycloakGetError
from app.models.users import UserDB, UserIn, UserOut
from passlib.hash import bcrypt
from app.models.users import UserDB, UserOut

router = APIRouter()


@router.post("", response_model=UserOut)
async def save_user(userIn: UserIn, db: MongoClient = Depends(dependencies.get_db)):

    # create keycloak user
    if settings.keycloak_enabled:
        firstName, lastName = userIn.full_name.split()
        try:
            keycloak_user = await create_user(
                userIn.email, userIn.password, firstName, lastName
            )
        except KeycloakGetError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=json.loads(e.error_message),
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        keycloak_user = None

    # create local user
    hashed_password = bcrypt.hash(userIn.password)
    userDB = UserDB(
        **userIn.dict(),
        hashed_password=hashed_password,
        keycloak_id=keycloak_user,
    )
    res = await db["users"].insert_one(userDB.to_mongo())
    found = await db["users"].find_one({"_id": res.inserted_id})
    return UserDB.from_mongo(found).dict(exclude={"create_at"})


@router.get("", response_model=List[UserOut])
async def get_users(
    db: MongoClient = Depends(dependencies.get_db), skip: int = 0, limit: int = 2
):
    users = []
    for doc in await db["users"].find().skip(skip).limit(limit).to_list(length=limit):
        users.append(UserOut(**doc))
    return users


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (user := await db["users"].find_one({"_id": ObjectId(user_id)})) is not None:
        return UserOut.from_mongo(user)
    raise HTTPException(status_code=404, detail=f"User {user_id} not found")


@router.get("/username/{username}", response_model=UserOut)
async def get_user_by_name(
    username: str, db: MongoClient = Depends(dependencies.get_db)
):
    if (user := await db["users"].find_one({"email": username})) is not None:
        return UserOut.from_mongo(user)
    raise HTTPException(status_code=404, detail=f"User {username} not found")
