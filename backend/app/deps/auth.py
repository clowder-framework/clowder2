import logging
import secrets

from fastapi import Security, HTTPException, Depends, Header
from fastapi.security import APIKeyHeader
from keycloak import KeycloakGetError, KeycloakAuthenticationError
from passlib.handlers.pbkdf2 import pbkdf2_sha256
from pymongo import MongoClient

from app.config import settings
from app.dependencies import get_db
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
        decoded_token = keycloak_openid.decode_token(
            token,
            key=key,
            options={"verify_aud": False},
        )
        return decoded_token["preferred_username"]
    except Exception as e:
        logger.info(f"Error jwt decode: {e}")
        return None


async def key_auth(X_API_KEY=Header(None), db: MongoClient = Depends(get_db)):
    """Check if X-API-KEY header exists and if so check if it's equal to master key.

       TODO look up api key in database
    """
    if not X_API_KEY:
        return None
    if X_API_KEY == settings.API_MASTER_KEY:
        return "lmarini@illinois.edu"
    else:
        user = await find_user(X_API_KEY, db)
        if user:
            return user
    raise HTTPException(status_code=403)


async def jwt_or_key_auth(key_result=Depends(key_auth), jwt_result=Depends(jwt_auth)) -> str:
    """
    Secure endpoints by either having to provide a JWT token or an API key.

    Args:
        key_result: dependency injected API Key. None if not set.
        jwt_result: dependency injected JWT token. None if not set.

    Returns:
        User id, an email address
    """
    if not (key_result or jwt_result):
        raise HTTPException(status_code=401, detail="Not authenticated")
    else:
        if key_result:
            return key_result
        if jwt_result:
            return jwt_result


def create_key() -> str:
    """Generate API key."""
    generated_key: str = secrets.token_urlsafe(32)
    return generated_key


def create_hash(key) -> str:
    hash = pbkdf2_sha256.hash(key, salt=b"a"*22)
    return hash


def verify_key(key, hash) -> bool:
    return pbkdf2_sha256.verify(key, hash)


async def find_user(key: str, db: MongoClient) -> str:
    """
    Search database for which user has key. Returns None if no user found.

    Args:
        key: api key

    Returns:
        Returns user id or None, if user not found.
    """
    hash = create_hash(key)
    found = await db["apikeys"].find_one({"hash": hash})
    try:
        if found:
            email = found["user"]["email"]
            return email
        else:
            return None
    except KeyError:
        return None


