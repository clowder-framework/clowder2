import json
import logging
from secrets import token_urlsafe

import requests
from app.config import settings
from app.keycloak_auth import (
    get_idp_public_key,
    keycloak_openid,
    oauth2_scheme,
    retreive_refresh_token,
)
from app.models.tokens import TokenDB
from app.models.users import UserLogin
from app.routers.utils import save_refresh_token, get_token
from fastapi import APIRouter, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError, jwt
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError
from starlette.responses import RedirectResponse

router = APIRouter()
security = HTTPBearer()

logger = logging.getLogger(__name__)


@router.get("/register")
async def register() -> RedirectResponse:
    return RedirectResponse(settings.auth_register_url)


@router.get("/login")
async def loginGet() -> RedirectResponse:
    """Redirect to keycloak login page."""
    return RedirectResponse(
        keycloak_openid.auth_url(
            redirect_uri=settings.auth_redirect_uri,
            scope="openid email",
            state=token_urlsafe(32),
        )
    )


@router.get("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Logout of keycloak."""
    # get user info
    access_token = credentials.credentials
    try:
        user_info = keycloak_openid.userinfo(access_token)
        if (
            token_exist := await TokenDB.find_one({"email": user_info["email"]})
        ) is not None:
            # log user out
            try:
                keycloak_openid.logout(token_exist.refresh_token)

                # delete entry in the token database
                await token_exist.delete()
                return {"status": f"Successfully logged user: {user_info} out!"}
            except:  # noqa: E722
                raise HTTPException(
                    status_code=403,
                    detail="Refresh token invalid/expired! Cannot log user out.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
    except:  # noqa: E722
        raise HTTPException(
            status_code=403,
            detail="Access token invalid! Cannot get user info.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    raise HTTPException(
        status_code=500,
        detail="Unable to the current log user out!",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/login")
async def loginPost(userIn: UserLogin):
    """Client can use this to login when redirect is not available."""
    try:
        token = keycloak_openid.token(userIn.email, userIn.password)
        await save_refresh_token(token["refresh_token"], userIn.email)
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


@router.get("")
async def auth(code: str) -> RedirectResponse:
    """Redirect endpoint Keycloak redirects to after login."""
    logger.info("In /api/v2/auth")

    token_body = await get_token(code)
    access_token = token_body["access_token"]

    # redirect to frontend
    auth_url = f"{settings.frontend_url}/auth"

    response = RedirectResponse(url=auth_url)

    response.set_cookie("Authorization", value=f"Bearer {access_token}")
    logger.info(f"Authenticated by keycloak. Redirecting to {auth_url}")

    return response


@router.get("/token")
async def token(code: str):
    return await get_token(code)


@router.get("/refresh_token")
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    access_token = credentials.credentials

    try:
        # token still valid
        token_json = keycloak_openid.decode_token(
            access_token,
            key=await get_idp_public_key(),
            options={"verify_aud": False},
        )
        email = token_json["email"]
        return await retreive_refresh_token(email)
    except (ExpiredSignatureError, JWTError):
        # retreive the refresh token and try refresh
        email = jwt.get_unverified_claims(access_token)["email"]
        return await retreive_refresh_token(email)
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


@router.get("/broker/{identity_provider}/token")
def get_idenity_provider_token(
    identity_provider: str, access_token: str = Security(oauth2_scheme)
):
    """Get identity provider JWT token from keyclok. Keycloak must be configured to store external tokens."""
    if identity_provider in settings.keycloak_ipds:
        idp_url = f"{settings.auth_base}/auth/realms/{settings.auth_realm}/broker/{identity_provider}/token"
        idp_headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {access_token}",
        }
        idp_token = requests.request("GET", idp_url, headers=idp_headers)
        if idp_token.status_code == 200:
            itp_token_body = json.loads(idp_token.content)
            return itp_token_body
        else:
            raise HTTPException(status_code=400, detail=idp_token.text)
    else:
        raise HTTPException(
            status_code=400,
            detail={
                "error_msg": f"Identy provider [{identity_provider}] not recognized."
            },
            headers={"WWW-Authenticate": "Bearer"},
        )
