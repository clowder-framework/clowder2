# Based on https://github.com/tiangolo/fastapi/issues/1428
import json
import logging
from datetime import datetime
from typing import Optional

from fastapi import Depends, HTTPException, Security
from fastapi.security import APIKeyCookie, APIKeyHeader, OAuth2AuthorizationCodeBearer
from itsdangerous.exc import BadSignature
from itsdangerous.url_safe import URLSafeSerializer
from jose import ExpiredSignatureError
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError
from keycloak.keycloak_admin import KeycloakAdmin
from keycloak.keycloak_openid import KeycloakOpenID
from pydantic import Json

from .config import settings
from .models.tokens import TokenDB
from .models.users import ListenerAPIKeyDB, UserAPIKeyDB, UserDB, UserOut

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

# Passing in API key via header. `auto_error=False` makes it so `get_current_user()` runs even if it doesn't find it
api_key_header = APIKeyHeader(name="X-API-KEY", auto_error=False)

# Passing in JWT token via cookie. `auto_error=False` makes it so `get_current_user()` runs even if it doesn't find it.
jwt_header = APIKeyCookie(name="Authorization", auto_error=False)


async def get_token(
    token: str = Security(oauth2_scheme),
    api_key: str = Security(api_key_header),
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
                await ListenerAPIKeyDB.find_one(
                    ListenerAPIKeyDB.user == payload["user"],
                    ListenerAPIKeyDB.key == payload["key"],
                )
            ) is not None:
                return {"email": payload["user"]}
            elif (
                key := await UserAPIKeyDB.find_one(
                    UserAPIKeyDB.user == payload["user"],
                    UserAPIKeyDB.key == payload["key"],
                )
            ) is not None:
                current_time = datetime.utcnow()
                if key.expires is not None and current_time >= key.expires:
                    # Expired key, delete it first
                    await key.delete()
                    raise HTTPException(
                        status_code=401,
                        detail={"error": "Key is expired."},
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                else:
                    return {"email": payload["user"]}
            else:
                raise HTTPException(
                    status_code=401,
                    detail={"error": "Key is invalid."},
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except BadSignature:
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
    return identity["email"]


async def get_current_user(
    token: str = Security(oauth2_scheme),
    api_key: str = Security(api_key_header),
    token_cookie: str = Security(jwt_header),
) -> UserOut:
    """Retrieve the user object from Mongo by first getting user id from JWT and then querying Mongo.
    Potentially expensive. Use `get_current_username` if all you need is user name.
    """

    if token:
        try:
            userinfo = keycloak_openid.userinfo(token)
            user = await UserDB.find_one(UserDB.email == userinfo["email"])
            return UserOut(**user.dict())
        except KeycloakAuthenticationError as e:
            if not e.error_message:
                if e.response_code == 401:
                    e.error_message = '{"error": "Unauthenticated"}'
            raise HTTPException(
                status_code=e.response_code,
                detail=json.loads(e.error_message),
                headers={"WWW-Authenticate": "Bearer"},
            )
    if token_cookie:
        try:
            userinfo = keycloak_openid.userinfo(token_cookie.removeprefix("Bearer%20"))
            user = await UserDB.find_one(UserDB.email == userinfo["email"])
            return UserOut(**user.dict())
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
                key := await ListenerAPIKeyDB.find_one(
                    ListenerAPIKeyDB.user == payload["user"],
                    ListenerAPIKeyDB.key == payload["key"],
                )
            ) is not None:
                user = await UserDB.find_one(UserDB.email == key.user)
                return UserOut(**user.dict())
            elif (
                key := await UserAPIKeyDB.find_one(
                    UserAPIKeyDB.user == payload["user"],
                    UserAPIKeyDB.key == payload["key"],
                )
            ) is not None:
                current_time = datetime.utcnow()

                if key.expires is not None and current_time >= key.expires:
                    # Expired key, delete it first
                    await key.delete()
                    raise HTTPException(
                        status_code=401,
                        detail={"error": "Key is expired."},
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                else:
                    user = await UserDB.find_one(UserDB.email == key.user)
                    return UserOut(**user.dict())
            else:
                raise HTTPException(
                    status_code=401,
                    detail={"error": "Key is invalid."},
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except BadSignature:
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
    token_cookie: str = Security(jwt_header),
) -> str:
    """Retrieve the user id from the JWT token. Does not query MongoDB."""
    if token:
        try:
            userinfo = keycloak_openid.userinfo(token)
            return userinfo["email"]
        # expired token
        except KeycloakAuthenticationError as e:
            if not e.error_message:
                if e.response_code == 401:
                    e.error_message = '{"error": "Unauthenticated"}'
            raise HTTPException(
                status_code=e.response_code,
                detail=json.loads(e.error_message),
                headers={"WWW-Authenticate": "Bearer"},
            )

    if token_cookie:
        try:
            userinfo = keycloak_openid.userinfo(token_cookie.removeprefix("Bearer%20"))
            return userinfo["email"]
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
                key := await ListenerAPIKeyDB.find_one(
                    ListenerAPIKeyDB.user == payload["user"],
                    ListenerAPIKeyDB.key == payload["key"],
                )
            ) is not None:
                # Key is coming from a listener job
                return key.user
            elif (
                key := await UserAPIKeyDB.find_one(
                    UserAPIKeyDB.user == payload["user"],
                    UserAPIKeyDB.key == payload["key"],
                )
            ) is not None:
                # Key is coming from a user request
                current_time = datetime.utcnow()

                if key.expires is not None and current_time >= key.expires:
                    # Expired key, delete it first
                    await key.delete()
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
        except BadSignature:
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


async def get_read_only_user(
    token: str = Security(oauth2_scheme),
    api_key: str = Security(api_key_header),
    token_cookie: str = Security(jwt_header),
) -> bool:
    """Retrieve the user object from Mongo by first getting user id from JWT and then querying Mongo.
    Potentially expensive. Use `get_current_username` if all you need is user name.
    """

    if token:
        try:
            userinfo = keycloak_openid.userinfo(token)
            user = await UserDB.find_one(UserDB.email == userinfo["email"])
            return user.read_only_user
        except KeycloakAuthenticationError as e:
            raise HTTPException(
                status_code=e.response_code,
                detail=json.loads(e.error_message),
                headers={"WWW-Authenticate": "Bearer"},
            )
    if token_cookie:
        try:
            userinfo = keycloak_openid.userinfo(token_cookie.removeprefix("Bearer%20"))
            user = await UserDB.find_one(UserDB.email == userinfo["email"])
            return user.read_only_user
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
                key := await ListenerAPIKeyDB.find_one(
                    ListenerAPIKeyDB.user == payload["user"],
                    ListenerAPIKeyDB.key == payload["key"],
                )
            ) is not None:
                user = await UserDB.find_one(UserDB.email == key.user)
                return user.read_only_user
            elif (
                key := await UserAPIKeyDB.find_one(
                    UserAPIKeyDB.user == payload["user"],
                    UserAPIKeyDB.key == payload["key"],
                )
            ) is not None:
                current_time = datetime.utcnow()

                if key.expires is not None and current_time >= key.expires:
                    # Expired key, delete it first
                    await key.delete()
                    raise HTTPException(
                        status_code=401,
                        detail={"error": "Key is expired."},
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                else:
                    user = await UserDB.find_one(UserDB.email == key.user)
                    return user.read_only_user
            else:
                raise HTTPException(
                    status_code=401,
                    detail={"error": "Key is invalid."},
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except BadSignature:
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
            "enabled": settings.keycloak_default_enabled,
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


async def update_user(
    email: str,
    new_email: Optional[str],
    new_password: Optional[str],
    new_firstName: Optional[str],
    new_lastName: Optional[str],
):
    """Update existing user in Keycloak."""
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
    existing_user_id = keycloak_admin.get_user_id(email)
    existing_user = keycloak_admin.get_user(existing_user_id)
    # Update user and set password
    keycloak_admin.update_user(
        existing_user_id,
        {
            "email": new_email or existing_user["email"],
            "username": new_email or existing_user["email"],
            "firstName": new_firstName or existing_user["firstName"],
            "lastName": new_lastName or existing_user["lastName"],
        },
    )
    if new_password:
        keycloak_admin.set_user_password(existing_user_id, new_password, False)

    updated_user = keycloak_admin.get_user(existing_user_id)
    return updated_user


def delete_user(email: str):
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
    user_id = keycloak_admin.get_user_id(username=email)
    if user_id:
        delete_response = keycloak_admin.delete_user(user_id)
        return delete_response


async def retreive_refresh_token(email: str):
    token_exist = await TokenDB.find_one(TokenDB.email == email)
    if token_exist is not None:
        try:
            new_tokens = keycloak_openid.refresh_token(token_exist.refresh_token)
            # update the refresh token in the database
            token_exist.refresh_token = new_tokens["refresh_token"]
            await token_exist.save()
            return {"access_token": new_tokens["access_token"]}
        except KeycloakGetError as e:
            # refresh token invalid; remove from database
            await token_exist.delete()
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


async def enable_disable_user(email: str, set_enable: bool):
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
    user_id = keycloak_admin.get_user_id(username=email)
    if user_id:
        if set_enable:
            keycloak_admin.enable_user(user_id)
        else:
            keycloak_admin.disable_user(user_id)
    else:
        raise Exception("keycloak doesnot have user: " + str)
