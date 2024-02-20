from datetime import datetime
from typing import Optional

from beanie import PydanticObjectId
from beanie.operators import Or, Push, RegEx
from bson.objectid import ObjectId
from fastapi import HTTPException, Depends, APIRouter

from app.deps.authorization_deps import AuthorizationDB, GroupAuthorization
from app.keycloak_auth import get_current_user, get_user
from app.models.authorization import RoleType
from app.models.groups import GroupOut, GroupIn, GroupDB, GroupBase, Member
from app.models.pages import _get_page_query, Paged, _construct_page_metadata
from app.models.users import UserOut, UserDB
from app.routers.authentication import get_admin_mode, get_admin

from backend.app.models.licenses import LicenseOut, LicenseIn, LicenseDB, LicenseBase

router = APIRouter()


@router.post("", response_model=LicenseOut)
async def save_license(
    license_in: LicenseIn,
    user=Depends(get_current_user),
):
    license_db = LicenseDB(**license_in, creator=user)
    await license_db.insert()
    return license_db.dict()


@router.get("/{license_id}", response_model=GroupOut)
async def get_license(
    license_id: str,
    allow: bool = Depends(GroupAuthorization("viewer")),
):
    if (license := await LicenseDB.get(PydanticObjectId(license_id))) is not None:
        return license.dict()
    raise HTTPException(status_code=404, detail=f"Group {license_id} not found")

@router.put("/{license_id}", response_model=GroupOut)
async def edit_license(
    license_id: str,
    license_info: LicenseBase,
    user_id=Depends(get_user),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    if (license := await GroupDB.get(PydanticObjectId(license_id))) is not None:
        license_dict = dict(license_info) if license_info is not None else {}

        if len(license_dict["name"]) == 0 or len(license_dict["holders"]) == 0:
            raise HTTPException(
                status_code=400,
                detail="License name can't be null or user list can't be empty",
            )
            return

        user = await UserDB.find_one(UserDB.email == user_id)
        license.creator = user.dict()
        license.modified = datetime.utcnow()
        license.holders = license_dict['holders']
        license.type = license_dict['text']
        license.url = license_dict['url']
        license.version = license_dict['version']
        license.allow_download = license_dict['allow_download']
        license.replace()

        return license.dict()
    raise HTTPException(status_code=404, detail=f"License {license_id} not found")


@router.delete("/{license_id}", response_model=GroupOut)
async def delete_license(
    license_id: str,
    allow: bool = Depends(GroupAuthorization("owner")),
):
    if (license := await LicenseDB.get(PydanticObjectId(license_id))) is not None:
        await license.delete()
        return license.dict()  # TODO: Do we need to return what we just deleted?
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {license_id} not found")



