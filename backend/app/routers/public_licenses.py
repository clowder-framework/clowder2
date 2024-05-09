from typing import List

from app.models.licenses import LicenseDB, LicenseOption, LicenseOut, standard_licenses
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/{license_id}", response_model=LicenseOut)
async def get_license(license_id: str):
    if (license := await LicenseDB.get(PydanticObjectId(license_id))) is not None:
        return license.dict()
    raise HTTPException(
        status_code=404, detail=f"License not found for id {license_id}"
    )


@router.get("/standard_licenses/all", response_model=List[LicenseOption])
def get_standard_licenses():
    return standard_licenses


@router.get("/standard_licenses/{license_id}", response_model=str)
def get_standard_license_url(license_id: str):
    for license in standard_licenses:
        if license.id == license_id:
            # Return the URL if the license ID is found
            return license.url

        # If license ID is not found, raise HTTP 404 error
    raise HTTPException(status_code=404, detail="Standard License ID not found")
