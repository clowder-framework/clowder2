# Based on https://github.com/tiangolo/fastapi/issues/1428
import json
import logging
from datetime import datetime

from bson import ObjectId
from fastapi import Security, HTTPException, Depends
from fastapi.security import OAuth2AuthorizationCodeBearer, APIKeyHeader
from itsdangerous.exc import BadSignature
from itsdangerous.url_safe import URLSafeSerializer
from jose import ExpiredSignatureError
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError
from keycloak.keycloak_admin import KeycloakAdmin
from keycloak.keycloak_openid import KeycloakOpenID
from pydantic import Json
from pymongo import MongoClient

from . import dependencies
from .config import settings
from .models.users import UserOut, UserAPIKey

logger = logging.getLogger(__name__)

# Keycloak open id client configuration
logging.info(f"Keycloak open id server {settings.auth_server_url}")
keycloak_openid = KeycloakOpenID(
    server_url=settings.auth_server_url,
    client_id=settings.auth_client_id,
    realm_name=settings.auth_realm,
    client_secret_key=settings.auth_client_secret,
    verify=True,
)


# Used to decode JWT token
async def get_idp_public_key():
    return (
        "-----BEGIN PUBLIC KEY-----\n"
        f"{keycloak_openid.public_key()}"
        "\n-----END PUBLIC KEY-----"
    )


# oauth2 config used by fastapi security scheme below
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=settings.oauth2_scheme_auth_url,
    tokenUrl=settings.auth_token_url,
    auto_error=False,
)

# Passing in API key via header
api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)


async def get_token(
    token: str = Security(oauth2_scheme),
    api_key: str = Security(api_key_header),
    db: MongoClient = Depends(dependencies.get_db),
) -> Json:
    """Decode token. Use to secure endpoints."""
    if token:
        try:
            # See https://github.com/marcospereirampj/python-keycloak/issues/89
            return keycloak_openid.decode_token(
                token,
                key=await get_idp_public_key(),
                options={"verify_aud": False},
            )
        except ExpiredSignatureError as e:
            raise HTTPException(
                status_code=401,
                detail=str(e),  # "token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except KeycloakGetError as e:
            raise HTTPException(
                status_code=e.response_code,
                detail=str(e),  # "Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except KeycloakAuthenticationError as e:
            raise HTTPException(
                status_code=401,
                detail=str(e),
                headers={"WWW-Authenticate": "Bearer"},
            )

    if api_key:
        serializer = URLSafeSerializer(settings.local_auth_secret, salt="api_key")
        try:
            payload = serializer.loads(api_key)
            # Key is valid, check expiration date in database
            if (
                key_entry := await db["user_keys"].find_one(
                    {"user": payload["user"], "key": payload["key"]}
                )
            ) is not None:
                key = UserAPIKey.from_mongo(key_entry)
                current_time = datetime.utcnow()

                if key.expires is not None and current_time >= key.expires:
                    # Expired key, delete it first
                    db["user_keys"].delete_one({"_id": ObjectId(key.id)})
                    raise HTTPException(
                        status_code=401,
                        detail={"error": "Key is expired."},
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                else:
                    return {"preferred_username": payload["user"]}
            else:
                raise HTTPException(
                    status_code=401,
                    detail={"error": "Key is invalid."},
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except BadSignature as e:
            raise HTTPException(
                status_code=401,
                detail={"error": "Key is invalid."},
                headers={"WWW-Authenticate": "Bearer"},
            )

    raise HTTPException(
        status_code=401,
        detail="Not authenticated.",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_user(identity: Json = Depends(get_token)):
    """Retrieve the user email from keycloak token."""
    return identity["preferred_username"]


async def get_current_user(
    token: str = Security(oauth2_scheme),
    api_key: str = Security(api_key_header),
    db: MongoClient = Depends(dependencies.get_db),
) -> UserOut:
    """Retrieve the user object from Mongo by first getting user id from JWT and then querying Mongo.
    Potentially expensive. Use `get_current_username` if all you need is user name.
    """

    if token:
        try:
            userinfo = keycloak_openid.userinfo(token)
            user_out = await db["users"].find_one({"email": userinfo["email"]})
            return UserOut.from_mongo(user_out)
        except KeycloakAuthenticationError as e:
            raise HTTPException(
                status_code=e.response_code,
                detail=json.loads(e.error_message),
                headers={"WWW-Authenticate": "Bearer"},
            )

    if api_key:
        serializer = URLSafeSerializer(settings.local_auth_secret, salt="api_key")
        try:
            payload = serializer.loads(api_key)
            # Key is valid, check expiration date in database
            if (
                key_entry := await db["user_keys"].find_one(
                    {"user": payload["user"], "key": payload["key"]}
                )
            ) is not None:
                key = UserAPIKey.from_mongo(key_entry)
                current_time = datetime.utcnow()

                if key.expires is not None and current_time >= key.expires:
                    # Expired key, delete it first
                    db["user_keys"].delete_one({"_id": ObjectId(key.id)})
                    raise HTTPException(
                        status_code=401,
                        detail={"error": "Key is expired."},
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                else:
                    user_out = await db["users"].find_one({"email": key.user})
                    return UserOut.from_mongo(user_out)
            else:
                raise HTTPException(
                    status_code=401,
                    detail={"error": "Key is invalid."},
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except BadSignature as e:
            raise HTTPException(
                status_code=401,
                detail={"error": "Key is invalid."},
                headers={"WWW-Authenticate": "Bearer"},
            )

    raise HTTPException(
        status_code=401,
        detail="Not authenticated.",  # "token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_username(
    token: str = Security(oauth2_scheme),
    api_key: str = Security(api_key_header),
    db: MongoClient = Depends(dependencies.get_db),
) -> str:
    """Retrieve the user id from the JWT token. Does not query MongoDB."""
    if token:
        try:
            userinfo = keycloak_openid.userinfo(token)
            return userinfo["preferred_username"]
        # expired token
        except KeycloakAuthenticationError as e:
            raise HTTPException(
                status_code=e.response_code,
                detail=json.loads(e.error_message),
                headers={"WWW-Authenticate": "Bearer"},
            )

    if api_key:
        serializer = URLSafeSerializer(settings.local_auth_secret, salt="api_key")
        try:
            payload = serializer.loads(api_key)
            # Key is valid, check expiration date in database
            if (
                key_entry := await db["user_keys"].find_one(
                    {"user": payload["user"], "key": payload["key"]}
                )
            ) is not None:
                key = UserAPIKey.from_mongo(key_entry)
                current_time = datetime.utcnow()

                if key.expires is not None and current_time >= key.expires:
                    # Expired key, delete it first
                    db["user_keys"].delete_one({"_id": ObjectId(key.id)})
                    raise HTTPException(
                        status_code=401,
                        detail={"error": "Key is expired."},
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                else:
                    return key.user
            else:
                raise HTTPException(
                    status_code=401,
                    detail={"error": "Key is invalid."},
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except BadSignature as e:
            raise HTTPException(
                status_code=401,
                detail={"error": "Key is invalid."},
                headers={"WWW-Authenticate": "Bearer"},
            )

    raise HTTPException(
        status_code=401,
        detail="Not authenticated.",  # "token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_username_or_anonymous_user(
    token: str = Security(oauth2_scheme),
    api_key: str = Security(api_key_header),
    db: MongoClient = Depends(dependencies.get_db),
) -> str:
    """Retrieve the user id from the JWT token. Does not query MongoDB."""
    if not token and not api_key:
        return "anonymoususer@clowder.org"
    elif token:
        try:
            userinfo = keycloak_openid.userinfo(token)
            return userinfo["preferred_username"]
        # expired token
        except KeycloakAuthenticationError as e:
            raise HTTPException(
                status_code=e.response_code,
                detail=json.loads(e.error_message),
                headers={"WWW-Authenticate": "Bearer"},
            )

    elif api_key:
        serializer = URLSafeSerializer(settings.local_auth_secret, salt="api_key")
        try:
            payload = serializer.loads(api_key)
            # Key is valid, check expiration date in database
            if (
                key_entry := await db["user_keys"].find_one(
                    {"user": payload["user"], "key": payload["key"]}
                )
            ) is not None:
                key = UserAPIKey.from_mongo(key_entry)
                current_time = datetime.utcnow()

                if key.expires is not None and current_time >= key.expires:
                    # Expired key, delete it first
                    db["user_keys"].delete_one({"_id": ObjectId(key.id)})
                    raise HTTPException(
                        status_code=401,
                        detail={"error": "Key is expired."},
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                else:
                    return key.user
            else:
                raise HTTPException(
                    status_code=401,
                    detail={"error": "Key is invalid."},
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except BadSignature as e:
            raise HTTPException(
                status_code=401,
                detail={"error": "Key is invalid."},
                headers={"WWW-Authenticate": "Bearer"},
            )


async def get_current_user_id(identity: Json = Depends(get_token)) -> str:
    """Retrieve internal Keycloak id. Does not query MongoDB."""
    keycloak_id = identity["sub"]
    return keycloak_id


async def create_user(email: str, password: str, firstName: str, lastName: str):
    """Create a user in Keycloak."""
    keycloak_admin = KeycloakAdmin(
        server_url=settings.auth_server_url,
        username=settings.keycloak_username,
        password=settings.keycloak_password,
        realm_name=settings.keycloak_realm_name,
        user_realm_name=settings.keycloak_user_realm_name,
        # client_secret_key=settings.auth_client_secret,
        # client_id=settings.keycloak_client_id,
        verify=True,
    )
    # Add user and set password
    user = keycloak_admin.create_user(
        {
            "email": email,
            "username": email,
            "enabled": True,
            "firstName": firstName,
            "lastName": lastName,
            "credentials": [
                {
                    "value": password,
                    "type": "password",
                }
            ],
        },
        exist_ok=False,
    )
    return user


async def retreive_refresh_token(
    email: str, db: MongoClient = Depends(dependencies.get_db)
):
    if (token_exist := await db["tokens"].find_one({"email": email})) is not None:
        try:
            new_tokens = keycloak_openid.refresh_token(token_exist["refresh_token"])
            # update the refresh token in the database
            token_exist.update({"refresh_token": new_tokens["refresh_token"]})
            await db["tokens"].replace_one(
                {"_id": ObjectId(token_exist["_id"])}, token_exist
            )
            return {"access_token": new_tokens["access_token"]}
        except KeycloakGetError as e:
            # refresh token invalid; remove from database
            await db["tokens"].delete_one({"_id": ObjectId(token_exist["_id"])})
            raise HTTPException(
                status_code=401,
                detail=str(e),  # "Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "JWT token signature expired and cannot be refreshed"
            },  # "Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
