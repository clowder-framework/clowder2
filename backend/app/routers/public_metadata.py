from typing import List, Optional

from app.keycloak_auth import get_current_user
from app.models.metadata import MetadataDefinitionDB, MetadataDefinitionOut
from beanie import PydanticObjectId
from beanie.odm.operators.find.evaluation import RegEx
from beanie.odm.operators.find.logical import Or
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()


@router.get("/definition", response_model=List[MetadataDefinitionOut])
async def get_metadata_definition_list(
    name: Optional[str] = None,
    skip: int = 0,
    limit: int = 2,
):
    if name is None:
        defs = await MetadataDefinitionDB.find(
            sort=(-MetadataDefinitionDB.created), skip=skip, limit=limit
        ).to_list()
    else:
        defs = await MetadataDefinitionDB.find(
            MetadataDefinitionDB.name == name,
            sort=(-MetadataDefinitionDB.created),
            skip=skip,
            limit=limit,
        ).to_list()
    return [mddef.dict() for mddef in defs]


@router.get(
    "/definition/{metadata_definition_id}", response_model=MetadataDefinitionOut
)
async def get_metadata_definition(
    metadata_definition_id: str,
    user=Depends(get_current_user),
):
    if (
        mdd := await MetadataDefinitionDB.get(PydanticObjectId(metadata_definition_id))
    ) is not None:
        return mdd.dict()
    raise HTTPException(
        status_code=404,
        detail=f"Metadata definition {metadata_definition_id} not found",
    )


@router.get(
    "/definition/search/{search_term}", response_model=List[MetadataDefinitionOut]
)
async def search_metadata_definition(
    search_term: str,
    skip: int = 0,
    limit: int = 10,
    user=Depends(get_current_user),
):
    """Search all metadata definition in the db based on text.

    Arguments:
        text -- any text matching name or description
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
    """

    mdds = await MetadataDefinitionDB.find(
        Or(
            RegEx(field=MetadataDefinitionDB.name, pattern=search_term, options="i"),
            RegEx(
                field=MetadataDefinitionDB.description, pattern=search_term, options="i"
            ),
            RegEx(field=MetadataDefinitionDB.context, pattern=search_term, options="i"),
        ),
        sort=(-MetadataDefinitionDB.created),
        skip=skip,
        limit=limit,
    ).to_list()

    return [mdd.dict() for mdd in mdds]
