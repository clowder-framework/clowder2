import json
import logging
from typing import Dict

import jwt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security.utils import get_authorization_scheme_param
from keycloak.keycloak_openid import KeycloakOpenID
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError
from starlette import status
from starlette.requests import Request
from starlette.responses import RedirectResponse

from app import keycloak
from app.config import settings


# This actually does the auth checks
from app.models.users import UserIn

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


logger = logging.getLogger(__name__)
logger.setLevel("DEBUG")

router = APIRouter()


@router.get("/login")
async def login() -> RedirectResponse:
    return RedirectResponse(settings.auth_url)


@router.post("/login")
async def login(userIn: UserIn):
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


@router.get("/auth")
async def auth(code: str) -> RedirectResponse:
    payload = (
        f"grant_type=authorization_code&code={code}"
        f"&redirect_uri={settings.auth_url}&client_id=app"
    )
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    token_response = requests.request(
        "POST", settings.auth_token_url, data=payload, headers=headers
    )

    token_body = json.loads(token_response.content)
    access_token = token_body["access_token"]

    # should we redirect to frontend root? or return html with a copy/paste box with access_token?
    # response = RedirectResponse(url="/")
    # response.set_cookie("Authorization", value=f"Bearer {access_token}")
    # return response

    return {"token": access_token}


@router.get("")
async def root(
    request: Request,
) -> Dict:
    authorization: str = request.cookies.get("Authorization")
    scheme, credentials = get_authorization_scheme_param(authorization)

    try:
        # https://github.com/marcospereirampj/python-keycloak/issues/89
        return keycloak_openid.decode_token(
            credentials,
            key=await get_idp_public_key(),
            options={"verify_signature": True, "verify_aud": False, "exp": True},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/protected")
def protected(user=Depends(keycloak.get_current_username)) -> Dict:
    return {"status": user}


@router.get("/public")
def public() -> Dict:
    return {"status": "public"}
