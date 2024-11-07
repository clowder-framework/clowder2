import json

from app.keycloak_auth import (
    create_user,
    enable_disable_user,
    get_current_user,
    keycloak_openid,
    update_user,
)
from app.models.datasets import DatasetDBViewList
from app.models.users import UserDB, UserIn, UserLogin, UserOut, UserUpdate
from app.routers.utils import save_refresh_token
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException
from keycloak.exceptions import (
    KeycloakAuthenticationError,
    KeycloakGetError,
    KeycloakPostError,
    KeycloakPutError,
)
from passlib.hash import bcrypt

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


async def authenticate_user(email: str, password: str):
    user = await UserDB.find_one({"email": email})
    if not user:
        return None
    if not user.verify_password(password):
        return None
    return user


@router.patch("/users/me", response_model=UserOut)
async def update_current_user(
    userUpdate: UserUpdate, current_user=Depends(get_current_user)
):
    try:
        await update_user(
            current_user.email,
            userUpdate.email,
            userUpdate.password,
            userUpdate.first_name,
            userUpdate.last_name,
        )
    except KeycloakGetError as e:
        raise HTTPException(
            status_code=e.response_code,
            detail=json.loads(e.error_message),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except KeycloakPutError as e:
        raise HTTPException(
            status_code=e.response_code,
            detail=json.loads(e.error_message),
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update local user
    user = await UserDB.find_one(UserDB.email == current_user.email)

    if userUpdate.email:
        user.email = userUpdate.email
    if userUpdate.first_name:
        user.first_name = userUpdate.first_name
    if userUpdate.last_name:
        user.last_name = userUpdate.last_name
    if userUpdate.password:
        user.hashed_password = bcrypt.hash(userUpdate.password)

    await user.save()
    return user.dict()


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
        and (
            dataset_db := await DatasetDBViewList.find_one(
                DatasetDBViewList.id == PydanticObjectId(dataset_id)
            )
        )
        is not None
    ):
        # TODO: question regarding resource creator is considered as admin of the resource?
        return dataset_db.creator.email == current_username.email
    else:
        return False


@router.get("/users/me/admin_mode")
async def get_admin_mode(
    enable_admin: bool = False, current_username=Depends(get_current_user)
) -> bool:
    """Get Admin mode from User Object."""
    if (
        current_user := await UserDB.find_one(UserDB.email == current_username.email)
    ) is not None:
        if current_user.admin:
            if enable_admin:
                return True
            elif current_user.admin_mode is not None:
                return current_user.admin_mode
            else:
                return False
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
    if admin and current_username.admin:
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


@router.post("/users/revoke_admin/{useremail}", response_model=UserOut)
async def revoke_admin(
    useremail: str, current_username=Depends(get_current_user), admin=Depends(get_admin)
):
    if admin:
        if current_username.email == useremail:
            raise HTTPException(
                status_code=403,
                detail="You are currently an admin. Admin cannot revoke their own admin access.",
            )
        else:
            if (user := await UserDB.find_one(UserDB.email == useremail)) is not None:
                user.admin = False
                user.admin_mode = False  # make sure to disable admin mode as well
                await user.replace()
                return user.dict()
            else:
                raise HTTPException(
                    status_code=404, detail=f"User {useremail} not found"
                )
    else:
        raise HTTPException(
            status_code=403,
            detail=f"User {current_username.email} is not an admin. Only admin can revoke admin access.",
        )


@router.post("/users/enable_readonly/{useremail}", response_model=UserOut)
async def enable_readonly_user(
    useremail: str, current_username=Depends(get_current_user), admin=Depends(get_admin)
):
    if admin:
        if (user := await UserDB.find_one(UserDB.email == useremail)) is not None:
            if not user.admin:
                user.read_only_user = True
                await user.replace()
                return user.dict()
            else:
                raise HTTPException(
                    status_code=403,
                    detail=f"User {useremail} is admin cannot be read only",
                )
        else:
            raise HTTPException(status_code=404, detail=f"User {useremail} not found")
    else:
        raise HTTPException(
            status_code=403,
            detail=f"User {current_username.email} is not an admin. Only admin can make others admin.",
        )


@router.post("/users/disable_readonly/{useremail}", response_model=UserOut)
async def disable_readonly_user(
    useremail: str, current_username=Depends(get_current_user), admin=Depends(get_admin)
):
    if admin:
        if (user := await UserDB.find_one(UserDB.email == useremail)) is not None:
            if not user.admin:
                user.read_only_user = False
                await user.replace()
                return user.dict()
            else:
                raise HTTPException(
                    status_code=403,
                    detail=f"User {useremail} is admin cannot be read only",
                )
        else:
            raise HTTPException(status_code=404, detail=f"User {useremail} not found")
    else:
        raise HTTPException(
            status_code=403,
            detail=f"User {current_username.email} is not an admin. Only admin can make others admin.",
        )


@router.post("/users/enable/{useremail}", response_model=UserOut)
async def user_enable(
    useremail: str, current_username=Depends(get_current_user), admin=Depends(get_admin)
):
    if admin:
        if current_username.email == useremail:
            raise HTTPException(
                status_code=403,
                detail="You are currently an admin. Admin cannot enable their own self.",
            )
        else:
            if (user := await UserDB.find_one(UserDB.email == useremail)) is not None:
                try:
                    await enable_disable_user(useremail, True)
                except KeycloakGetError as e:
                    raise HTTPException(
                        status_code=e.response_code,
                        detail=json.loads(e.error_message),
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                return user.dict()
            else:
                raise HTTPException(
                    status_code=404, detail=f"User {useremail} not found"
                )
    else:
        raise HTTPException(
            status_code=403,
            detail=f"User {current_username.email} is not an admin. Only admin can enable user access.",
        )


@router.post("/users/disable/{useremail}", response_model=UserOut)
async def user_disable(
    useremail: str, current_username=Depends(get_current_user), admin=Depends(get_admin)
):
    if admin:
        if current_username.email == useremail:
            raise HTTPException(
                status_code=403,
                detail="You are currently an admin. Admin cannot disable their own self.",
            )
        else:
            if (user := await UserDB.find_one(UserDB.email == useremail)) is not None:
                try:
                    await enable_disable_user(useremail, False)
                except KeycloakGetError as e:
                    raise HTTPException(
                        status_code=e.response_code,
                        detail=json.loads(e.error_message),
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                return user.dict()
            else:
                raise HTTPException(
                    status_code=404, detail=f"User {useremail} not found"
                )
    else:
        raise HTTPException(
            status_code=403,
            detail=f"User {current_username.email} is not an admin. Only admin can disable user access.",
        )
