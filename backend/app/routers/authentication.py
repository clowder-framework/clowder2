import json

from fastapi import APIRouter, HTTPException, Depends
from keycloak.exceptions import (
    KeycloakAuthenticationError,
    KeycloakGetError,
    KeycloakPostError,
)
from passlib.hash import bcrypt
from pymongo import MongoClient

from app import dependencies
from app.keycloak_auth import create_user
from app.keycloak_auth import keycloak_openid
from app.models.users import UserDB, UserIn, UserOut, UserLogin

router = APIRouter()


@router.post("/users", response_model=UserOut)
async def save_user(userIn: UserIn, db: MongoClient = Depends(dependencies.get_db)):
    try:
        keycloak_user = await create_user(
            userIn.email, userIn.password, userIn.first_name, userIn.last_name
        )
    except KeycloakGetError as e:
        raise HTTPException(
            status_code=e.response_code,
            detail=json.loads(e.error_message),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except KeycloakPostError as e:
        print(f"User {userIn.email} already exists")
        raise HTTPException(
            status_code=e.response_code,
            detail=json.loads(e.error_message),
            headers={"WWW-Authenticate": "Bearer"},
        )

    # create local user
    hashed_password = bcrypt.hash(userIn.password)
    userDB = UserDB(
        **userIn.dict(),
        hashed_password=hashed_password,
        keycloak_id=keycloak_user,
    )
    res = await UserDB.insert_one(userDB)
    found = await UserDB.find_one({"_id": res.inserted_id})
    return UserOut.from_mongo(found).dict(exclude={"create_at"})


@router.post("/login")
async def login(userIn: UserLogin, db: MongoClient = Depends(dependencies.get_db)):
    try:
        token = keycloak_openid.token(userIn.email, userIn.password)
        return {"token": token["access_token"]}
    # bad credentials
    except KeycloakAuthenticationError as e:
        raise HTTPException(
            status_code=e.response_code,
            detail=json.loads(e.error_message),
            headers={"WWW-Authenticate": "Bearer"},
        )
    # account not fully setup (for example if new password is set to temporary)
    except KeycloakGetError as e:
        raise HTTPException(
            status_code=e.response_code,
            detail=json.loads(e.error_message),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def authenticate_user(email: str, password: str, db: MongoClient):
    user = await UserDB.find_one({"email": email})
    current_user = UserDB.from_mongo(user)
    if not user:
        return None
    if not current_user.verify_password(password):
        return None
    return current_user
