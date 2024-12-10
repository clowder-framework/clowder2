from datetime import datetime
from typing import List

from app.keycloak_auth import get_current_user, get_user
from app.models.licenses import (
    LicenseBase,
    LicenseDB,
    LicenseIn,
    LicenseOption,
    LicenseOut,
    standard_licenses,
)
from app.routers.authentication import get_admin, get_admin_mode
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()
public_router = APIRouter()


@router.post("", response_model=LicenseOut)
async def save_license(
    license_in: LicenseIn,
    user=Depends(get_current_user),
):
    if license_in.holders is None:
        license_in = user
    license_db = LicenseDB(**license_in.dict(), creator=user.email)
    await license_db.insert()
    return license_db.dict()


@public_router.get("/{license_id}", response_model=LicenseOut)
@router.get("/{license_id}", response_model=LicenseOut)
async def get_license(license_id: str):
    if (license := await LicenseDB.get(PydanticObjectId(license_id))) is not None:
        return license.dict()
    raise HTTPException(
        status_code=404, detail=f"License not found for id {license_id}"
    )


# Endpoint to retrieve standard license options
@public_router.get("/standard_licenses/all", response_model=List[LicenseOption])
@router.get("/standard_licenses/all", response_model=List[LicenseOption])
def get_standard_licenses():
    return standard_licenses


@public_router.get("/standard_licenses/{license_id}", response_model=str)
@router.get("/standard_licenses/{license_id}", response_model=str)
def get_standard_license_url(license_id: str):
    for license in standard_licenses:
        if license.id == license_id:
            # Return the URL if the license ID is found
            return license.url

        # If license ID is not found, raise HTTP 404 error
    raise HTTPException(status_code=404, detail="Standard License ID not found")


@router.put("/{license_id}", response_model=LicenseOut)
async def edit_license(
    license_id: str,
    license_info: LicenseBase,
    user_id=Depends(get_user),
    admin=Depends(get_admin),
    enable_admin: bool = False,
    admin_mode: bool = Depends(get_admin_mode),
):
    if (license := await LicenseDB.get(PydanticObjectId(license_id))) is not None:
        if license.creator != user_id and not (admin and admin_mode):
            raise HTTPException(
                status_code=403,
                detail=f"User {user_id} doesn't have permission to edit license {license_id}",
            )
        license_dict = dict(license_info) if license_info is not None else {}

        if (
            len(license_dict["name"]) == 0
            or len(license_dict["description"]) == 0
            or len(license_dict["url"]) == 0
            or len(license_dict["holders"]) == 0
        ):
            raise HTTPException(
                status_code=400,
                detail="License name/description/url/holders can't be null or empty",
            )
            return

        license.modified = datetime.utcnow()
        license.holders = license_dict["holders"]
        license.description = license_dict["description"]
        license.url = license_dict["url"]
        license.version = license_dict["version"]
        license.expiration_date = license_dict["expiration_date"]
        license.name = license_dict["name"]
        await license.replace()

        return license.dict()
    raise HTTPException(status_code=404, detail=f"License {license_id} not found")


@router.delete("/{license_id}", response_model=LicenseOut)
async def delete_license(
    license_id: str,
    user_id=Depends(get_user),
    admin=Depends(get_admin),
    enable_admin: bool = False,
    admin_mode: bool = Depends(get_admin_mode),
):
    if (license := await LicenseDB.get(PydanticObjectId(license_id))) is not None:
        if license.creator != user_id and not (admin and admin_mode):
            raise HTTPException(
                status_code=403,
                detail=f"User {user_id} doesn't have permission to delete license {license_id}",
            )
        await license.delete()
        return license.dict()  # TODO: Do we need to return what we just deleted?
    else:
        raise HTTPException(status_code=404, detail=f"License {license_id} not found")
