import datetime
import io
import os
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from fastapi import Form
from pymongo import MongoClient

from app import keycloak_auth
from app import dependencies
from app.keycloak_auth import get_user, get_current_user, UserOut
from app.config import settings
from app.models.datasets import DatasetOut
from app.models.listeners import ListenerIn
from app.models.metadata import (
    MongoDBRef,
    MetadataAgent,
    MetadataDefinitionOut,
    MetadataIn,
    MetadataDB,
    MetadataOut,
    MetadataPatch,
    validate_context,
    patch_metadata,
    MetadataDelete,
)

router = APIRouter()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


async def _build_metadata_db_obj(
    db: MongoClient,
    metadata_in: MetadataIn,
    dataset: DatasetOut,
    user: UserOut,
    agent: MetadataAgent = None,
):
    contents = await validate_context(
        db,
        metadata_in.contents,
        metadata_in.definition,
        metadata_in.context_url,
        metadata_in.context,
    )

    if agent is None:
        # Build MetadataAgent depending on whether extractor info is present
        extractor_info = metadata_in.extractor_info
        if extractor_info is not None:
            extractor_in = ListenerIn(**extractor_info.dict())
            if (
                extractor := await db["extractors"].find_one(
                    {"_id": extractor_in.id, "version": extractor_in.version}
                )
            ) is not None:
                agent = MetadataAgent(creator=user, extractor=extractor)
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            agent = MetadataAgent(creator=user)

    dataset_ref = MongoDBRef(collection="datasets", resource_id=dataset.id)

    # Apply any typecast fixes from definition validation
    metadata_in = metadata_in.dict()
    metadata_in["contents"] = contents
    return MetadataDB(
        **metadata_in,
        resource=dataset_ref,
        agent=agent,
    )


@router.post("/{dataset_id}/metadata", response_model=MetadataOut)
async def add_dataset_metadata(
    metadata_in: MetadataIn,
    dataset_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    """Attach new metadata to a dataset. The body must include a contents field with the JSON metadata, and either a
    context JSON-LD object, context_url, or definition (name of a metadata definition) to be valid.

    Returns:
        Metadata document that was added to database
    """
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        dataset = DatasetOut(**dataset)
        # If dataset already has metadata using this definition, don't allow duplication
        definition = metadata_in.definition
        if definition is not None:
            existing_q = {"resource.resource_id": dataset.id, "definition": definition}
            # Extracted metadata doesn't care about user
            if metadata_in.extractor_info is not None:
                existing_q["agent.extractor.name"] = metadata_in.extractor_info.name
                existing_q[
                    "agent.extractor.version"
                ] = metadata_in.extractor_info.version
            else:
                existing_q["agent.creator.id"] = user.id
            if (existing := await db["metadata"].find_one(existing_q)) is not None:
                raise HTTPException(
                    409, f"Metadata for {definition} already exists on this dataset"
                )

        md = await _build_metadata_db_obj(db, metadata_in, dataset, user)
        new_metadata = await db["metadata"].insert_one(md.to_mongo())
        found = await db["metadata"].find_one({"_id": new_metadata.inserted_id})
        metadata_out = MetadataOut.from_mongo(found)
        return metadata_out


@router.put("/{dataset_id}/metadata", response_model=MetadataOut)
async def replace_dataset_metadata(
    metadata_in: MetadataIn,
    dataset_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        query = {"resource.resource_id": ObjectId(dataset_id)}

        # Filter by MetadataAgent
        extractor_info = metadata_in.extractor_info
        if extractor_info is not None:
            if (
                extractor := await db["extractors"].find_one(
                    {"name": extractor_info.name, "version": extractor_info.version}
                )
            ) is not None:
                agent = MetadataAgent(creator=user, extractor=extractor)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query["agent.extractor.name"] = agent.extractor.name
                query["agent.extractor.version"] = agent.extractor.version
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query["agent.creator.id"] = agent.creator.id

        if (md := await db["metadata"].find_one(query)) is not None:
            # Metadata exists, so prepare the new document we are going to replace it with
            md_obj = _build_metadata_db_obj(db, metadata_in, dataset, user, agent=agent)
            new_metadata = await db["metadata"].replace_one(
                {"_id": md["_id"]}, md_obj.to_mongo()
            )
            found = await db["metadata"].find_one({"_id": md["_id"]})
            metadata_out = MetadataOut.from_mongo(found)
            return metadata_out
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.patch("/{dataset_id}/metadata", response_model=MetadataOut)
async def update_dataset_metadata(
    metadata_in: MetadataPatch,
    dataset_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        query = {"resource.resource_id": ObjectId(dataset_id)}
        contents = metadata_in.contents

        if metadata_in.metadata_id is not None:
            # If a specific metadata_id is provided, validate the patch against existing context
            if (
                existing_md := await db["metadata"].find_one(
                    {"_id": ObjectId(metadata_in.metadata_id)}
                )
            ) is not None:
                contents = await validate_context(
                    db,
                    metadata_in.contents,
                    existing_md.definition,
                    existing_md.context_url,
                    existing_md.context,
                )
                query["_id"] = metadata_in.metadata_id
        else:
            # Use provided definition name as filter (don't validate yet, as patched data doesn't require completeness)
            # TODO: Should context_url also be unique to the file version?
            definition = metadata_in.definition
            if definition is not None:
                query["definition"] = definition

        # Filter by MetadataAgent
        extractor_info = metadata_in.extractor_info
        if extractor_info is not None:
            if (
                extractor := await db["extractors"].find_one(
                    {"name": extractor_info.name, "version": extractor_info.version}
                )
            ) is not None:
                agent = MetadataAgent(creator=user, extractor=extractor)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query["agent.extractor.name"] = agent.extractor.name
                query["agent.extractor.version"] = agent.extractor.version
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query["agent.creator.id"] = agent.creator.id

        if (md := await db["metadata"].find_one(query)) is not None:
            # TODO: Refactor this with permissions checks etc.
            result = await patch_metadata(md, contents, db)
            return result
        else:
            raise HTTPException(
                status_code=404, detail=f"Metadata matching the query not found"
            )
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/metadata", response_model=List[MetadataOut])
async def get_dataset_metadata(
    dataset_id: str,
    extractor_name: Optional[str] = Form(None),
    extractor_version: Optional[float] = Form(None),
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        query = {"resource.resource_id": ObjectId(dataset_id)}

        if extractor_name is not None:
            query["agent.extractor.name"] = extractor_name
        if extractor_version is not None:
            query["agent.extractor.version"] = extractor_version

        metadata = []
        async for md in db["metadata"].find(query):
            md_out = MetadataOut.from_mongo(md)
            if md_out.definition is not None:
                if (
                    md_def := await db["metadata.definitions"].find_one(
                        {"name": md_out.definition}
                    )
                ) is not None:
                    md_def = MetadataDefinitionOut(**md_def)
                    md_out.description = md_def.description
            metadata.append(md_out)
        return metadata
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.delete("/{dataset_id}/metadata", response_model=MetadataOut)
async def delete_dataset_metadata(
    metadata_in: MetadataDelete,
    dataset_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:

        # filter by metadata_id or definition
        query = {"resource.resource_id": ObjectId(dataset_id)}
        if metadata_in.metadata_id is not None:
            # If a specific metadata_id is provided, delete the matching entry
            if (
                existing_md := await db["metadata"].find_one(
                    {"metadata_id": ObjectId(metadata_in.metadata_id)}
                )
            ) is not None:
                query["metadata_id"] = metadata_in.metadata_id
        else:
            # Use provided definition name as filter
            # TODO: Should context_url also be unique to the file version?
            definition = metadata_in.definition
            if definition is not None:
                query["definition"] = definition

        # if extractor info is provided
        # Filter by MetadataAgent
        extractor_info = metadata_in.extractor_info
        if extractor_info is not None:
            if (
                extractor := await db["extractors"].find_one(
                    {"name": extractor_info.name, "version": extractor_info.version}
                )
            ) is not None:
                agent = MetadataAgent(creator=user, extractor=extractor)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query["agent.extractor.name"] = agent.extractor.name
                query["agent.extractor.version"] = agent.extractor.version
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query["agent.creator.id"] = agent.creator.id

        if (md := await db["metadata"].find_one(query)) is not None:
            metadata_deleted = md
            if await db["metadata"].delete_one({"_id": md["_id"]}) is not None:
                return MetadataOut.from_mongo(metadata_deleted)
        else:
            raise HTTPException(
                status_code=404, detail=f"No metadata found with that criteria"
            )
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
