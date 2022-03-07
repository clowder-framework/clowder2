import json

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi import APIRouter, HTTPException, Depends
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError
from pymongo import MongoClient
from starlette import status

from app import dependencies
from app.auth import AuthHandler
from app.config import settings
from app.keycloak import keycloak_openid
from app.models.users import UserDB, UserIn

auth_handler = AuthHandler()

router = APIRouter()


@router.post("/login")
async def login(userIn: UserIn, db: MongoClient = Depends(dependencies.get_db)):
    if settings.keycloak_enabled:
        try:
            token = keycloak_openid.token(userIn.email, userIn.password)
            return {"token": token["access_token"]}
        # bad credentials
        except KeycloakAuthenticationError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=json.loads(e.error_message),
                headers={"WWW-Authenticate": "Bearer"},
            )
        # account not fully setup (for example if new password is set to temporary)
        except KeycloakGetError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=json.loads(e.error_message),
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:  # local authentication
        authenticated_user = await authenticate_user(userIn.email, userIn.password, db)
        if authenticated_user is None:
            raise HTTPException(
                status_code=401, detail=f"Could not authenticate user credentials"
            )
        else:
            token = auth_handler.encode_token(str(authenticated_user.id))
            return {"token": token}


@router.get("/unprotected")
def unprotected():
    return {"hello": "world"}


@router.get("/protected")
async def protected(
    userid=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
):
    result = await db["users"].find_one({"_id": ObjectId(userid)})
    user = UserDB.from_mongo(result)
    name = user.email
    return {"name": name, "id": userid}


async def authenticate_user(email: str, password: str, db: MongoClient):
    user = await db["users"].find_one({"email": email})
    current_user = UserDB.from_mongo(user)
    if not user:
        return None
    if not current_user.verify_password(password):
        return None
    return current_user
