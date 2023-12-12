import json

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends
from keycloak.exceptions import (
    KeycloakAuthenticationError,
    KeycloakGetError,
    KeycloakPostError,
)
from passlib.hash import bcrypt

from app.keycloak_auth import create_user, get_current_user
from app.keycloak_auth import keycloak_openid
from app.models.datasets import DatasetDB
from app.models.users import UserDB, UserIn, UserOut, UserLogin

router = APIRouter()


@router.post("/users", response_model=UserOut)
async def save_user(userIn: UserIn):
    try:
        keycloak_user = await create_user(
            userIn.email, userIn.password, userIn.first_name, userIn.last_name
        )
    except KeycloakGetError as e:
        raise HTTPException(
            status_code=e.response_code,
            detail=json.loads(e.error_message),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except KeycloakPostError as e:
        print(f"User {userIn.email} already exists")
        raise HTTPException(
            status_code=e.response_code,
            detail=json.loads(e.error_message),
            headers={"WWW-Authenticate": "Bearer"},
        )

    # create local user
    hashed_password = bcrypt.hash(userIn.password)

    # check if this is the 1st user, make it admin
    count = await UserDB.count()

    if count == 0:
        user = UserDB(
            **userIn.dict(),
            admin=True,
            hashed_password=hashed_password,
            keycloak_id=keycloak_user,
        )
    else:
        user = UserDB(
            **userIn.dict(),
            admin=False,
            hashed_password=hashed_password,
            keycloak_id=keycloak_user,
        )

    await user.insert()
    return user.dict()


@router.post("/login")
async def login(userIn: UserLogin):
    try:
        token = keycloak_openid.token(userIn.email, userIn.password)
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


async def authenticate_user(email: str, password: str):
    user = await UserDB.find_one({"email": email})
    if not user:
        return None
    if not user.verify_password(password):
        return None
    return user


@router.get("/users/me/is_admin", response_model=bool)
async def get_admin(
    dataset_id: str = None, current_username=Depends(get_current_user)
) -> bool:
    if (
        current_user := await UserDB.find_one(UserDB.email == current_username.email)
    ) is not None:
        if current_user.admin:
            return current_user.admin
    elif (
        dataset_id
        and (dataset_db := await DatasetDB.get(PydanticObjectId(dataset_id)))
        is not None
    ):
        # TODO: question regarding resource creator is considered as admin of the resource?
        return dataset_db.creator.email == current_username.email
    else:
        return False


@router.get("/users/me/admin_mode")
async def get_admin_mode(current_username=Depends(get_current_user)) -> bool:
    """Get Admin mode from User Object."""
    if (
        current_user := await UserDB.find_one(UserDB.email == current_username.email)
    ) is not None:
        if current_user.admin_mode is not None:
            return current_user.admin_mode
        else:
            return False
    else:
        raise HTTPException(
            status_code=404,
            detail="User doesn't exist.",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/users/me/admin_mode", response_model=bool)
async def set_admin_mode(
    admin_mode_on: bool,
    admin=Depends(get_admin),
    current_username=Depends(get_current_user),
) -> bool:
    """Set Admin mode from User Object."""
    if (
        current_user := await UserDB.find_one(UserDB.email == current_username.email)
    ) is not None:
        # only admin can set admin mode
        if admin:
            current_user.admin_mode = admin_mode_on
            await current_user.replace()
            return current_user.admin_mode
        else:
            raise HTTPException(
                status_code=403,
                detail="You are not admin yet. Only admin can set admin mode.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        raise HTTPException(
            status_code=404,
            detail="User doesn't exist.",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/users/set_admin/{useremail}", response_model=UserOut)
async def set_admin(
    useremail: str, current_username=Depends(get_current_user), admin=Depends(get_admin)
):
    if admin:
        if (user := await UserDB.find_one(UserDB.email == useremail)) is not None:
            user.admin = True
            await user.replace()
            return user.dict()
        else:
            raise HTTPException(status_code=404, detail=f"User {useremail} not found")
    else:
        raise HTTPException(
            status_code=403,
            detail=f"User {current_username.email} is not an admin. Only admin can make others admin.",
        )
