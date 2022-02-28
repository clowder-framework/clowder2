# Based on https://github.com/tiangolo/fastapi/issues/1428
import json

from fastapi.security import OAuth2AuthorizationCodeBearer
from keycloak.keycloak_openid import KeycloakOpenID
from keycloak.exceptions import KeycloakAuthenticationError
from pymongo import MongoClient

from . import dependencies
from .config import settings
from fastapi import Security, HTTPException, status, Depends
from pydantic import Json

# This is just for fastapi docs
from .models.users import UserBase, get_user_out

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=settings.auth_url,
    tokenUrl=settings.auth_token_url,
)

# This actually does the auth checks
keycloak_openid = KeycloakOpenID(
    server_url=settings.auth_server_url,
    client_id=settings.auth_client_id,
    realm_name=settings.auth_realm,
    client_secret_key=settings.auth_client_secret,
    verify=True,
)


async def get_idp_public_key():
    return (
        "-----BEGIN PUBLIC KEY-----\n"
        f"{keycloak_openid.public_key()}"
        "\n-----END PUBLIC KEY-----"
    )


async def get_auth(token: str = Security(oauth2_scheme)) -> Json:
    try:
        # See https://github.com/marcospereirampj/python-keycloak/issues/89
        return keycloak_openid.decode_token(
            token,
            key=await get_idp_public_key(),
            options={"verify_signature": True, "verify_aud": False, "exp": True},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),  # "Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    token: str = Security(oauth2_scheme),
    db: MongoClient = Depends(dependencies.get_db),
) -> str:
    """Retrieve the user object from Mongo by first getting user id from JWT and then querying Mongo.
    Potentially expensive. Use `get_current_username` if all you need is user name.
    """
    userinfo = keycloak_openid.userinfo(token)
    user = await get_user_out(userinfo["preferred_username"], db)
    return user


async def get_current_username(token: str = Security(oauth2_scheme)) -> str:
    """Retrieve the user id from the JWT token."""
    try:
        userinfo = keycloak_openid.userinfo(token)
        return userinfo["preferred_username"]
    # expired token
    except KeycloakAuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=json.loads(e.error_message),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_keycloak_user_id(identity: Json = Depends(get_auth)) -> str:
    """Retrieve internal Keycloak id."""
    keycloak_id = identity["sub"]
    return keycloak_id
