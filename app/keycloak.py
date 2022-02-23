# Based on https://github.com/tiangolo/fastapi/issues/1428
from fastapi.security import OAuth2AuthorizationCodeBearer
from keycloak.keycloak_openid import KeycloakOpenID

from .config import settings
from fastapi import Security, HTTPException, status, Depends
from pydantic import Json

# This is just for fastapi docs
from .models.users import UserBase

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
        return keycloak_openid.decode_token(
            token,
            key=await get_idp_public_key(),
            options={"verify_signature": True, "verify_aud": True, "exp": True},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),  # "Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(identity: Json = Depends(get_auth)) -> UserBase:
    return UserBase.first_or_fail(
        identity["sub"]
    )  # get your user form the DB using identity['sub']
