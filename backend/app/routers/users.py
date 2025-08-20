from datetime import timedelta
from secrets import token_urlsafe

from app.config import settings
from app.keycloak_auth import get_current_username
from app.models.pages import Paged, _construct_page_metadata, _get_page_query
from app.models.users import (
    ListenerAPIKeyDB,
    UserAPIKeyDB,
    UserAPIKeyOut,
    UserDB,
    UserOut,
)
from beanie import PydanticObjectId
from beanie.operators import Or, RegEx
from fastapi import APIRouter, Depends, HTTPException
from itsdangerous.url_safe import URLSafeSerializer

router = APIRouter()


@router.get("/keys", response_model=Paged)
async def get_user_api_keys(
    current_user=Depends(get_current_username),
    skip: int = 0,
    limit: int = 10,
):
    """List all api keys that user has created

    Arguments:
        skip: number of page to skip
        limit: number to limit per page
    """
    apikeys_and_count = (
        await UserAPIKeyDB.find(UserAPIKeyDB.user == current_user)
        .aggregate(
            [_get_page_query(skip, limit, sort_field="created", ascending=False)],
        )
        .to_list()
    )
    page_metadata = _construct_page_metadata(apikeys_and_count, skip, limit)
    page = Paged(
        metadata=page_metadata,
        data=[
            UserAPIKeyOut(id=item.pop("_id"), **item)
            for item in apikeys_and_count[0]["data"]
        ],
    )
    return page.dict()


@router.post("/keys", response_model=str)
async def generate_user_api_key(
    name: str,
    mins: int = settings.local_auth_expiration,
    current_user=Depends(get_current_username),
):
    """Generate an API key that confers the user's privileges.

    Arguments:
        name: name of the api key
        mins: number of minutes before expiration (0 for no expiration)
    """
    serializer = URLSafeSerializer(settings.local_auth_secret, salt="api_key")
    unique_key = token_urlsafe(16)
    hashed_key = serializer.dumps({"user": current_user, "key": unique_key})
    user_key = UserAPIKeyDB(user=current_user, key=unique_key, name=name)
    if mins > 0:
        user_key.expires = user_key.created + timedelta(minutes=mins)
    await user_key.insert()
    return hashed_key


@router.delete("/keys/{key_id}", response_model=UserAPIKeyOut)
async def delete_user_api_key(
    key_id: str,
    current_user=Depends(get_current_username),
):
    """Delete API keys given ID

    Arguments:
        key_id: id of the apikey
    """
    if (apikey := await UserAPIKeyDB.get(PydanticObjectId(key_id))) is not None:
        # Only allow user to delete their own key
        if apikey.user == current_user:
            await apikey.delete()
            return apikey.dict()
        else:
            raise HTTPException(
                status_code=403, detail=f"API key {key_id} not allowed to be deleted."
            )
    else:
        raise HTTPException(status_code=404, detail=f"API key {key_id} not found.")


@router.get("", response_model=Paged)
async def get_users(skip: int = 0, limit: int = 2):
    users_and_count = await UserDB.aggregate(
        [_get_page_query(skip, limit, sort_field="email", ascending=True)],
    ).to_list()
    page_metadata = _construct_page_metadata(users_and_count, skip, limit)
    page = Paged(
        metadata=page_metadata,
        data=[
            UserOut(id=item.pop("_id"), **item) for item in users_and_count[0]["data"]
        ],
    )
    return page.dict()


@router.get("/search", response_model=Paged)
async def search_users(
    text: str,
    skip: int = 0,
    limit: int = 2,
):
    users_and_count = (
        await UserDB.find(
            Or(
                RegEx(field=UserDB.email, pattern=text, options="i"),
                RegEx(field=UserDB.first_name, pattern=text, options="i"),
                RegEx(field=UserDB.last_name, pattern=text, options="i"),
            )
        )
        .aggregate(
            [_get_page_query(skip, limit, sort_field="email", ascending=True)],
        )
        .to_list()
    )
    page_metadata = _construct_page_metadata(users_and_count, skip, limit)
    page = Paged(
        metadata=page_metadata,
        data=[
            UserOut(id=item.pop("_id"), **item) for item in users_and_count[0]["data"]
        ],
    )
    return page.dict()


@router.get("/prefixSearch", response_model=Paged)
async def search_users_prefix(
    prefix: str,
    skip: int = 0,
    limit: int = 2,
):
    query_regx = f"^{prefix}.*"
    users_and_count = (
        await UserDB.find(
            Or(RegEx(field=UserDB.email, pattern=query_regx, options="i")),
        )
        .aggregate(
            [_get_page_query(skip, limit, sort_field="email", ascending=True)],
        )
        .to_list()
    )
    page_metadata = _construct_page_metadata(users_and_count, skip, limit)
    page = Paged(
        metadata=page_metadata,
        data=[
            UserOut(id=item.pop("_id"), **item) for item in users_and_count[0]["data"]
        ],
    )
    return page.dict()


@router.get("/profile", response_model=UserOut)
async def get_profile(
    username=Depends(get_current_username),
):
    if (user := await UserDB.find_one(UserDB.email == username)) is not None:
        return user.dict()
    raise HTTPException(status_code=404, detail=f"User {username} not found")


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str):
    if (user := await UserDB.get(PydanticObjectId(user_id))) is not None:
        return user.dict()
    raise HTTPException(status_code=404, detail=f"User {user_id} not found")


@router.get("/username/{username}", response_model=UserOut)
async def get_user_by_name(username: str):
    if (user := await UserDB.find_one(UserDB.email == username)) is not None:
        return user.dict()
    raise HTTPException(status_code=404, detail=f"User {username} not found")


async def get_user_job_key(username: str):
    """Return a non-expiring API key to be sent to jobs (i.e. extractors). If it was deleted by the user, a new one
    will be created, otherwise it will be re-used."""
    key = "__user_job_key"
    if (
        job_key := await ListenerAPIKeyDB.find_one(
            ListenerAPIKeyDB.user == username, ListenerAPIKeyDB.name == key
        )
    ) is not None:
        return job_key.hash
    else:
        # TODO: enforce permissions here...
        serializer = URLSafeSerializer(settings.local_auth_secret, salt="api_key")
        unique_key = token_urlsafe(16)
        hashed_key = serializer.dumps({"user": username, "key": unique_key})
        user_key = ListenerAPIKeyDB(
            user=username, key=unique_key, hash=hashed_key, name=key
        )
        await user_key.insert()
        return hashed_key
