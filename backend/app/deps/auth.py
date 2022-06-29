import logging
import secrets

from fastapi import Security, HTTPException, Depends, Header
from fastapi.security import APIKeyHeader
from keycloak import KeycloakGetError, KeycloakAuthenticationError
from passlib.handlers.pbkdf2 import pbkdf2_sha256

from app.config import settings
from app.keycloak_auth import oauth2_scheme, keycloak_openid, get_idp_public_key

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())


async def jwt_auth(authorization=Header(None)):
    """Check if AUTHORIZATION header includes bearer token and if so, try to decode it.

       FIXME is decoding the token enough or should we check the TTL?
    """
    if not authorization:
        return None
    try:
        token = authorization.removeprefix("Bearer ")
        key = await get_idp_public_key()
        # See https://github.com/marcospereirampj/python-keycloak/issues/89
        keycloak_openid.decode_token(
            token,
            key=key,
            options={"verify_aud": False},
        )
        return True
    except Exception as e:
        logger.info(f"Error jwt decode: {e}")
        return None


def key_auth(X_API_KEY=Header(None)):
    """Check if X-API-KEY header exists and if so check if it's equal to master key.

       TODO look up api key in database
    """
    if not X_API_KEY:
        return None
    if X_API_KEY == settings.API_MASTER_KEY:
        return True
    else:
        raise HTTPException(status_code=403)


async def jwt_or_key_auth(key_result=Depends(key_auth), jwt_result=Depends(jwt_auth)):
    """Secure endpoints by either having to provide a JWT token or an API key."""
    if not (key_result or jwt_result):
        raise HTTPException(status_code=401, detail="Not authenticated asdfas")


def create_key() -> str:
    """Generate API key."""
    generated_key: str = secrets.token_urlsafe(32)
    return generated_key


def create_hash(key) -> str:
    hash = pbkdf2_sha256.hash(key)
    return hash


def verify_key(key, hash) -> bool:
    return pbkdf2_sha256.verify(key, hash)


