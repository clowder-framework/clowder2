# Based on https://github.com/tiangolo/fastapi/issues/1428
import json

from fastapi.security import OAuth2AuthorizationCodeBearer
from keycloak.keycloak_openid import KeycloakOpenID
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError
from keycloak.keycloak_admin import KeycloakAdmin
from pymongo import MongoClient

from . import dependencies
from .config import settings
from fastapi import Security, HTTPException, status, Depends
from pydantic import Json

from .models.users import get_user_out, UserOut

# Keycloak open id client configuration
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
    authorizationUrl=settings.auth_url,
    tokenUrl=settings.auth_token_url,
)


async def get_token(token: str = Security(oauth2_scheme)) -> Json:
    """Decode token. Use to secure endpoints."""
    try:
        # See https://github.com/marcospereirampj/python-keycloak/issues/89
        return keycloak_openid.decode_token(
            token,
            key=await get_idp_public_key(),
            options={"verify_aud": False},
        )
    except KeycloakGetError as e:
        raise HTTPException(
            status_code=e.response_code,
            detail=str(e),  # "Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_user(identity: Json = Depends(get_token)):
    return identity["preferred_username"]


async def get_current_user(
    token: str = Security(oauth2_scheme),
    db: MongoClient = Depends(dependencies.get_db),
) -> UserOut:
    """Retrieve the user object from Mongo by first getting user id from JWT and then querying Mongo.
    Potentially expensive. Use `get_current_username` if all you need is user name.
    """
    userinfo = keycloak_openid.userinfo(token)
    user = await get_user_out(userinfo["preferred_username"], db)
    return user


async def get_current_username(token: str = Security(oauth2_scheme)) -> str:
    """Retrieve the user id from the JWT token. Does not query MongoDB."""
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


async def get_current_user_id(identity: Json = Depends(get_token)) -> str:
    """Retrieve internal Keycloak id. Does not query MongoDB."""
    keycloak_id = identity["sub"]
    return keycloak_id


def create_realm_and_client():
    """Create a realm and client at start up."""
    keycloak_admin_realm = KeycloakAdmin(
        server_url=settings.auth_server_url,
        username=settings.keycloak_username,
        password=settings.keycloak_password,
        realm_name="master",
        verify=True,
    )
    keycloak_admin_realm.create_realm(
        payload={"realm": settings.auth_realm, "enabled": True}, skip_exists=True
    )
    keycloak_admin_client = KeycloakAdmin(
        server_url=settings.auth_server_url,
        username=settings.keycloak_username,
        password=settings.keycloak_password,
        realm_name=settings.keycloak_realm_name,
        user_realm_name=settings.keycloak_user_realm_name,
        verify=True,
    )
    # For options see https://www.keycloak.org/docs-api/15.0/rest-api/index.html#_clientrepresentation
    keycloak_admin_client.create_client(
        payload={
            "clientId": settings.auth_client_id,
            "publicClient": True,
            "rootUrl": settings.keycloak_base,
            "redirectUris": settings.keycloak_redirect_uris,
            "webOrigins": settings.keycloak_web_origins,
            "directAccessGrantsEnabled": True,
            "enabled": True,
        },
        skip_exists=True,
    )


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
