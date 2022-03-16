import json

import requests
from fastapi import APIRouter, HTTPException, Depends
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError
from pydantic import Json
from pymongo import MongoClient
from starlette import status
from starlette.responses import RedirectResponse

from app import keycloak, dependencies
from app.config import settings
from app.keycloak import keycloak_openid
from app.models.users import UserIn, UserDB

router = APIRouter()


@router.get("/login")
async def login() -> RedirectResponse:
    """Redirect to keycloak login page."""
    return RedirectResponse(settings.auth_url)


@router.get("/logout")
async def logout(token: Json = Depends(keycloak.get_token)):
    """Logout of keycloak."""
    keycloak_openid.logout(token["refresh_token"])
    return RedirectResponse(settings.frontend_url)


@router.post("/login")
async def login(userIn: UserIn):
    """Client can use this to login when redirect is not available."""
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


@router.get("")
async def auth(
    code: str, db: MongoClient = Depends(dependencies.get_db)
) -> RedirectResponse:
    """Redirect endpoint Keycloak redirects to after login."""

    # get token from Keycloak
    payload = (
        f"grant_type=authorization_code&code={code}"
        f"&redirect_uri={settings.auth_url}&client_id={settings.auth_client_id}"
    )
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    token_response = requests.request(
        "POST", settings.auth_token_url, data=payload, headers=headers
    )
    token_body = json.loads(token_response.content)
    access_token = token_body["access_token"]

    # get identity provider token if enabled. Here is an example for globus.
    # TODO add for loop to do this for all idps. Move to standalone util.
    if "globus" in settings.keycloak_ipds:
        idp_url = f"{settings.auth_base}/auth/realms/{settings.auth_realm}/broker/globus/token"
        idp_headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {access_token}",
        }
        idp_token = requests.request("GET", idp_url, headers=idp_headers)
        itp_token_body = json.loads(idp_token.content)

    # create user in db if it doesn't already exist
    userinfo = keycloak_openid.userinfo(access_token)
    keycloak_id = userinfo["sub"]
    given_name = userinfo["given_name"]
    family_name = userinfo["family_name"]
    email = userinfo["email"]
    user = UserDB(
        email=email,
        full_name=f"{given_name} {family_name}",
        hashed_password="",
        keycloak_id=keycloak_id,
    )
    if (await db["users"].find_one({"email": email})) is None:
        await db["users"].insert_one(user.to_mongo())

    # redirect to frontend
    auth_url = f"{settings.frontend_url}/auth"
    response = RedirectResponse(url=auth_url)
    response.set_cookie("Authorization", value=f"Bearer {access_token}")
    return response
