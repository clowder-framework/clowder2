import datetime
from typing import Optional

from app import dependencies
from app.deps.authorization_deps import MetadataAuthorization
from app.keycloak_auth import get_current_user
from app.models.metadata import (
    MetadataDB,
    MetadataDefinitionDB,
    MetadataDefinitionIn,
    MetadataDefinitionOut,
    MetadataOut,
    MetadataPatch,
    patch_metadata,
)
from app.models.pages import Paged, _construct_page_metadata, _get_page_query
from beanie import PydanticObjectId
from beanie.odm.operators.find.evaluation import RegEx
from beanie.odm.operators.find.logical import Or
from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()


@router.post("/definition", response_model=MetadataDefinitionOut)
async def save_metadata_definition(
    definition_in: MetadataDefinitionIn,
    user=Depends(get_current_user),
):
    existing = await MetadataDefinitionDB.find_one(
        MetadataDefinitionDB.name == definition_in.name
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Metadata definition named {definition_in.name} already exists.",
        )
    else:
        md_def = MetadataDefinitionDB(**definition_in.dict(), creator=user)
        await md_def.insert()
        return md_def.dict()


@router.get("/definition", response_model=Paged)
async def get_metadata_definition_list(
    name: Optional[str] = None,
    user=Depends(get_current_user),
    skip: int = 0,
    limit: int = 2,
):
    query = []
    if name is not None:
        query.append(MetadataDefinitionDB.name == name)

    mdds_and_count = (
        await MetadataDefinitionDB.find(*query)
        .aggregate(
            [_get_page_query(skip, limit, sort_field="name", ascending=True)],
        )
        .to_list()
    )
    page_metadata = _construct_page_metadata(mdds_and_count, skip, limit)
    page = Paged(
        metadata=page_metadata,
        data=[
            MetadataDefinitionOut(id=item.pop("_id"), **item)
            for item in mdds_and_count[0]["data"]
        ],
    )
    return page.dict()


@router.put(
    "/definition/{metadata_definition_id}", response_model=MetadataDefinitionOut
)
async def update_metadata_definition(
    metadata_definition: MetadataDefinitionIn,
    metadata_definition_id: str,
    user=Depends(get_current_user),
):
    existing_count = await MetadataDefinitionDB.find(
        {
            "$and": [
                {"_id": {"$ne": PydanticObjectId(metadata_definition_id)}},
                {"name": {"$eq": metadata_definition.name}},
            ]
        }
    ).count()
    if existing_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Metadata definition named {metadata_definition.name} already exists.",
        )
    else:
        if (
            mdd := await MetadataDefinitionDB.get(
                PydanticObjectId(metadata_definition_id)
            )
        ) is not None:
            # Check if metadata using this definition exists
            metadata_using_definition = await MetadataDB.find(
                MetadataDB.definition == mdd.name
            ).to_list()

            if len(metadata_using_definition) > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Metadata definition: {mdd.name} ({metadata_definition_id}) in use. "
                    f"You cannot edit it if there are existing metadata using this definition.",
                )
            try:
                metadata_update = metadata_definition.dict()
                metadata_update["modified"] = datetime.datetime.utcnow()

                # Update mdd's attributes using the updated dictionary
                for key, value in metadata_update.items():
                    setattr(mdd, key, value)
                await mdd.save()
                return mdd.dict()
            except Exception as e:
                raise HTTPException(status_code=500, detail=e.args[0])
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Metadata definition id {metadata_definition_id} not found",
            )


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


@router.delete(
    "/definition/{metadata_definition_id}", response_model=MetadataDefinitionOut
)
async def delete_metadata_definition(
    metadata_definition_id: str,
    user=Depends(get_current_user),
):
    """Delete metadata definition by specific ID."""
    mdd = await MetadataDefinitionDB.find_one(
        MetadataDefinitionDB.id == PydanticObjectId(metadata_definition_id)
    )
    if mdd:
        # Check if metadata using this definition exists
        metadata_using_definition = await MetadataDB.find(
            MetadataDB.definition == mdd.name
        ).to_list()

        if len(metadata_using_definition) > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Metadata definition: {mdd.name} ({metadata_definition_id}) in use. "
                f"You cannot delete it until all metadata records using it are deleted.",
            )

        # TODO: Refactor this with permissions checks etc.
        await mdd.delete()
        return mdd.dict()
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Metadata definition {metadata_definition_id} not found",
        )


@router.get("/definition/search/{search_term}", response_model=Paged)
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
    mdds_and_count = (
        await MetadataDefinitionDB.find(
            Or(
                RegEx(
                    field=MetadataDefinitionDB.name, pattern=search_term, options="i"
                ),
                RegEx(
                    field=MetadataDefinitionDB.description,
                    pattern=search_term,
                    options="i",
                ),
                RegEx(
                    field=MetadataDefinitionDB.context, pattern=search_term, options="i"
                ),
            ),
        )
        .aggregate(
            [_get_page_query(skip, limit, sort_field="name", ascending=True)],
        )
        .to_list()
    )
    page_metadata = _construct_page_metadata(mdds_and_count, skip, limit)
    page = Paged(
        metadata=page_metadata,
        data=[
            MetadataDefinitionOut(id=item.pop("_id"), **item)
            for item in mdds_and_count[0]["data"]
        ],
    )
    return page.dict()


@router.patch("/{metadata_id}", response_model=MetadataOut)
async def update_metadata(
    metadata_in: MetadataPatch,
    metadata_id: str,
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    user=Depends(get_current_user),
    allow: bool = Depends(MetadataAuthorization("editor")),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """
    md = await MetadataDB.find_one(MetadataDB.id == PydanticObjectId(metadata_id))
    if md:
        # TODO: Refactor this with permissions checks etc.
        return await patch_metadata(md, metadata_in.contents, es)
    else:
        raise HTTPException(status_code=404, detail=f"Metadata {metadata_id} not found")


@router.delete("/{metadata_id}")
async def delete_metadata(
    metadata_id: str,
    user=Depends(get_current_user),
    allow: bool = Depends(MetadataAuthorization("editor")),
):
    """Delete metadata by specific ID."""
    md = await MetadataDB.find_one(MetadataDB.id == PydanticObjectId(metadata_id))
    if md:
        # TODO: Refactor this with permissions checks etc.
        await md.delete()
        return {"deleted": metadata_id}
    else:
        raise HTTPException(status_code=404, detail=f"Metadata {metadata_id} not found")
