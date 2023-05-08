import os
from typing import List, Optional

from beanie import PydanticObjectId
from bson import ObjectId
from elasticsearch import Elasticsearch
from fastapi import APIRouter, HTTPException, Depends
from fastapi import Form
from pymongo import MongoClient

from app import dependencies
from app.deps.authorization_deps import Authorization
from app.keycloak_auth import get_current_user, UserOut
from app.models.datasets import DatasetOut, DatasetDB
from app.models.listeners import LegacyEventListenerIn
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
    MetadataDefinitionDB,
)
from app.search.connect import insert_record, update_record, delete_document_by_id

router = APIRouter()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


async def _build_metadata_db_obj(
        db: MongoClient,
        metadata_in: MetadataIn,
        dataset: DatasetOut,
        user: UserOut,
        agent: MetadataAgent = None,
):
    content = await validate_context(
        db,
        metadata_in.content,
        metadata_in.definition,
        metadata_in.context_url,
        metadata_in.context,
    )

    if agent is None:
        # Build MetadataAgent depending on whether extractor info is present
        if metadata_in.extractor is not None:
            extractor_in = LegacyEventListenerIn(**metadata_in.extractor.dict())
            if (
                    extractor := await db["listeners"].find_one(
                        {"_id": extractor_in.id, "version": extractor_in.version}
                    )
            ) is not None:
                agent = MetadataAgent(creator=user, extractor=extractor)
            else:
                raise HTTPException(status_code=404, detail=f"Listener not found")
        else:
            agent = MetadataAgent(creator=user)

    dataset_ref = MongoDBRef(collection="datasets", resource_id=dataset.id)

    # Apply any typecast fixes from definition validation
    metadata_in = metadata_in.dict()
    metadata_in["content"] = content
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
        es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
        allow: bool = Depends(Authorization("uploader")),
):
    """Attach new metadata to a dataset. The body must include a contents field with the JSON metadata, and either a
    context JSON-LD object, context_url, or definition (name of a metadata definition) to be valid.

    Returns:
        Metadata document that was added to database
    """
    dataset = await DatasetDB.get(PydanticObjectId(dataset_id))
    if dataset is not None:
        dataset = DatasetOut(**dataset.dict())
        # If dataset already has metadata using this definition, don't allow duplication
        definition = metadata_in.definition
        query = []
        if definition is not None:
            query.append(MetadataDB.resource.resource_id == dataset.id)
            query.append(MetadataDB.definition == definition)

            # Extracted metadata doesn't care about user
            if metadata_in.extractor is not None:
                query.append(
                    MetadataDB.agent.listener.name == metadata_in.extractor.name
                )
                query.append(
                    MetadataDB.agent.listener.version == metadata_in.extractor.version
                )
            else:
                query.append(MetadataDB.agent.creator.id == user.id)

        if (existing := await MetadataDB.find_one(*query)) is not None:
            raise HTTPException(
                409, f"Metadata for {definition} already exists on this dataset"
            )
        md = await _build_metadata_db_obj(db, metadata_in, dataset, user)
        new_metadata = await md.insert()
        metadata_out = MetadataOut(**new_metadata.dict())

        # Add an entry to the metadata index
        doc = {
            "resource_id": dataset_id,
            "resource_type": "dataset",
            "created": metadata_out.created.utcnow(),
            "creator": user.email,
            "content": metadata_out.content,
            "context_url": metadata_out.context_url,
            "context": metadata_out.context,
            "name": dataset.name,
            "resource_created": dataset.created,
            "author": dataset.author.email,
            "description": dataset.description,
        }
        insert_record(es, "metadata", doc, metadata_out.id)
        return metadata_out


@router.put("/{dataset_id}/metadata", response_model=MetadataOut)
async def replace_dataset_metadata(
        metadata_in: MetadataIn,
        dataset_id: str,
        user=Depends(get_current_user),
        db: MongoClient = Depends(dependencies.get_db),
        es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
        allow: bool = Depends(Authorization("editor")),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """
    dataset = await DatasetDB.get(PydanticObjectId(dataset_id))
    if dataset is not None:
        query = [MetadataDB.resource.resource_id == ObjectId(dataset_id)]
        # Filter by MetadataAgent
        if metadata_in.extractor is not None:
            if (
                    extractor := await db["listeners"].find_one(
                        {
                            "name": metadata_in.extractor.name,
                            "version": metadata_in.extractor.version,
                        }
                    )
            ) is not None:
                agent = MetadataAgent(creator=user, extractor=extractor)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query.append(MetadataDB.agent.listener.name == agent.listener.name)
                query.append(
                    MetadataDB.agent.listener.version == agent.listener.version
                )
            else:
                raise HTTPException(status_code=404, detail=f"Listener not found")
        else:
            agent = MetadataAgent(creator=user)
            query.append(MetadataDB.agent.creator.id == agent.creator.id)

        if (md := await MetadataDB.find_one(*query)) is not None:
            # Metadata exists, so prepare the new document we are going to replace it with
            md_obj = _build_metadata_db_obj(db, metadata_in, DatasetOut(**dataset.dict()), user, agent=agent)
            # TODO figure out how to do replace
            new_metadata = await db["metadata"].replace_one(
                {"_id": md["_id"]}, md_obj
            )
            found = await MetadataDB(MetadataDB.id == md["_id"])
            metadata_out = MetadataOut(**found.dict)
            # Update entry to the metadata index
            doc = {"doc": {"content": metadata_out["content"]}}
            update_record(es, "metadata", doc, metadata_out["_id"])
            return metadata_out
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.patch("/{dataset_id}/metadata", response_model=MetadataOut)
async def update_dataset_metadata(
        metadata_in: MetadataPatch,
        dataset_id: str,
        user=Depends(get_current_user),
        db: MongoClient = Depends(dependencies.get_db),
        es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
        allow: bool = Depends(Authorization("editor")),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """
    dataset = await DatasetDB.get(PydanticObjectId(dataset_id))
    if dataset is not None:
        query = [MetadataDB.resource.resource_id == ObjectId(dataset_id)]
        content = metadata_in.content

        if metadata_in.metadata_id is not None:
            # If a specific metadata_id is provided, validate the patch against existing context
            if (
                    existing_md := await MetadataDB.find_one(MetadataDB.id == ObjectId(metadata_in.metadata_id))
            ) is not None:
                content = await validate_context(
                    db,
                    metadata_in.content,
                    existing_md.definition,
                    existing_md.context_url,
                    existing_md.context,
                )
                query.append(MetadataDB.id == metadata_in.metadata_id)
        else:
            # Use provided definition name as filter (don't validate yet, as patched data doesn't require completeness)
            # TODO: Should context_url also be unique to the file version?
            definition = metadata_in.definition
            if definition is not None:
                query.append(MetadataDB.definition == definition)

        # Filter by MetadataAgent
        if metadata_in.extractor is not None:
            if (
                    listener := await db["listeners"].find_one(
                        {
                            "name": metadata_in.extractor.name,
                            "version": metadata_in.extractor.version,
                        }
                    )
            ) is not None:
                agent = MetadataAgent(creator=user, listener=listener)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query.append(MetadataDB.agent.listener.name == agent.listener.name)
                query.append(
                    MetadataDB.agent.listener.version == agent.listener.version
                )
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query.append(MetadataDB.agent.creator.id == agent.creator.id)

        if (md := await MetadataDB.find_one(*query)) is not None:
            # TODO: Refactor this with permissions checks etc.
            result = await patch_metadata(md.dict(), content, db, es)
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
        listener_name: Optional[str] = Form(None),
        listener_version: Optional[float] = Form(None),
        user=Depends(get_current_user),
        db: MongoClient = Depends(dependencies.get_db),
        allow: bool = Depends(Authorization("viewer")),
):
    dataset = await DatasetDB.get(PydanticObjectId(dataset_id))
    if dataset is not None:
        query = [MetadataDB.resource.resource_id == ObjectId(dataset_id)]

        if listener_name is not None:
            query.append(MetadataDB.agent.listener.name == listener_name)
        if listener_version is not None:
            query.append(MetadataDB.agent.listener.version == listener_version)

        metadata = []
        async for md in MetadataDB.find(*query):
            md_out = MetadataOut(**md.dict())
            if md_out.definition is not None:
                if (
                        md_df := MetadataDefinitionDB.find_one(MetadataDefinitionDB.name == md_out.definition)
                ) is not None:
                    md_def = MetadataDefinitionOut(md_df)
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
        es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
        allow: bool = Depends(Authorization("editor")),
):
    dataset = await DatasetDB.get(PydanticObjectId(dataset_id))
    if dataset is not None:
        # filter by metadata_id or definition
        query = [MetadataDB.resource.resource_id == ObjectId(dataset_id)]
        if metadata_in.metadata_id is not None:
            # If a specific metadata_id is provided, delete the matching entry
            if (
                    existing_md := await MetadataDB(
                        MetadataDB.metadata_id == ObjectId(metadata_in.metadata_id)
                    )
            ) is not None:
                query.append(MetadataDB.metadata_id == metadata_in.metadata_id)
        else:
            # Use provided definition name as filter
            # TODO: Should context_url also be unique to the file version?
            definition = metadata_in.definition
            if definition is not None:
                query.append(MetadataDB.definition == definition)

        # if extractor info is provided
        # Filter by MetadataAgent
        extractor_info = metadata_in.extractor_info
        if extractor_info is not None:
            if (
                    extractor := await db["listeners"].find_one(
                        {"name": extractor_info.name, "version": extractor_info.version}
                    )
            ) is not None:
                agent = MetadataAgent(creator=user, extractor=extractor)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query.append(MetadataDB.agent.listener.name == agent.listener.name)
                query.append(
                    MetadataDB.agent.listener.version == agent.listener.version
                )
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query.append(MetadataDB.agent.creator.id == agent.creator.id)

        # delete from elasticsearch
        delete_document_by_id(es, "metadata", str(metadata_in.id))

        if (md := MetadataDB.find_one(*query)) is not None:
            if await md.delete() is not None:
                return MetadataOut(md)
        else:
            raise HTTPException(
                status_code=404, detail=f"No metadata found with that criteria"
            )
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
