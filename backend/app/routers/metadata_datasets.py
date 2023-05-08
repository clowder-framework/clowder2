import os
from typing import List, Optional

from bson import ObjectId
from elasticsearch import Elasticsearch
from fastapi import APIRouter, HTTPException, Depends
from fastapi import Form

from app import dependencies
from app.deps.authorization_deps import Authorization
from app.keycloak_auth import get_current_user, UserOut
from app.models.datasets import DatasetOut, DatasetDB
from app.models.listeners import LegacyEventListenerIn, EventListenerDB
from app.models.metadata import (
    MongoDBRef,
    MetadataAgent,
    MetadataDefinitionDB,
    MetadataIn,
    MetadataDB,
    MetadataOut,
    MetadataPatch,
    validate_context,
    patch_metadata,
    MetadataDelete,
)
from app.search.connect import insert_record, update_record, delete_document_by_id

router = APIRouter()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


async def _build_metadata_db_obj(
    metadata_in: MetadataIn,
    dataset: DatasetOut,
    user: UserOut,
    agent: MetadataAgent = None,
):
    content = await validate_context(
        metadata_in.content,
        metadata_in.definition,
        metadata_in.context_url,
        metadata_in.context,
    )

    if agent is None:
        # Build MetadataAgent depending on whether extractor info is present
        if metadata_in.extractor is not None:
            extractor_in = LegacyEventListenerIn(**metadata_in.extractor.dict())
            listener = await EventListenerDB.find_one(
                EventListenerDB.id == extractor_in.id,
                EventListenerDB.version == extractor_in.version,
            )
            if listener:
                agent = MetadataAgent(creator=user, listener=listener)
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
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("uploader")),
):
    """Attach new metadata to a dataset. The body must include a contents field with the JSON metadata, and either a
    context JSON-LD object, context_url, or definition (name of a metadata definition) to be valid.

    Returns:
        Metadata document that was added to database
    """
    dataset = DatasetDB.find_one(DatasetDB.id == ObjectId(dataset_id))
    if dataset:
        # If dataset already has metadata using this definition, don't allow duplication
        definition = metadata_in.definition
        if definition is not None:
            existing_q = {"resource.resource_id": dataset.id, "definition": definition}
            # Extracted metadata doesn't care about user
            if metadata_in.extractor is not None:
                existing_q["agent.listener.name"] = metadata_in.extractor.name
                existing_q["agent.listener.version"] = metadata_in.extractor.version
            else:
                existing_q["agent.creator.id"] = user.id
            existing = await MetadataDB.find_one(existing_q)
            if existing:
                raise HTTPException(
                    409, f"Metadata for {definition} already exists on this dataset"
                )

        md = await _build_metadata_db_obj(metadata_in, dataset, user)
        await md.save()

        # Add an entry to the metadata index
        doc = {
            "resource_id": dataset_id,
            "resource_type": "dataset",
            "created": md.created.utcnow(),
            "creator": user.email,
            "content": md.content,
            "context_url": md.context_url,
            "context": md.context,
            "name": dataset.name,
            "resource_created": dataset.created,
            "author": dataset.author.email,
            "description": dataset.description,
        }
        insert_record(es, "metadata", doc, md.id)
        return md


@router.put("/{dataset_id}/metadata", response_model=MetadataOut)
async def replace_dataset_metadata(
    metadata_in: MetadataIn,
    dataset_id: str,
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """
    dataset = DatasetDB.find_one(DatasetDB.id == ObjectId(dataset_id))
    if dataset:
        query = {"resource.resource_id": ObjectId(dataset_id)}

        # Filter by MetadataAgent
        if metadata_in.extractor is not None:
            listener = EventListenerDB.find_one(
                EventListenerDB.name == metadata_in.extractor.name,
                EventListenerDB.version == metadata_in.extractor.version,
            )
            if listener:
                agent = MetadataAgent(creator=user, listener=listener)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query["agent.listener.name"] = agent.listener.name
                query["agent.listener.version"] = agent.listener.version
            else:
                raise HTTPException(status_code=404, detail=f"Listener not found")
        else:
            agent = MetadataAgent(creator=user)
            query["agent.creator.id"] = agent.creator.id

        md = await MetadataDB.find_one(query)
        if md:
            # Metadata exists, so prepare the new document we are going to replace it with
            md = _build_metadata_db_obj(metadata_in, dataset, user, agent=agent)
            await md.save()
            # Update entry to the metadata index
            doc = {"doc": {"content": md.content}}
            update_record(es, "metadata", doc, md.id)
            return md
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.patch("/{dataset_id}/metadata", response_model=MetadataOut)
async def update_dataset_metadata(
    metadata_in: MetadataPatch,
    dataset_id: str,
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """
    dataset = DatasetDB.find_one(DatasetDB.id == ObjectId(dataset_id))
    if dataset:
        query = {"resource.resource_id": ObjectId(dataset_id)}
        content = metadata_in.content

        if metadata_in.metadata_id is not None:
            # If a specific metadata_id is provided, validate the patch against existing context
            existing = await MetadataDB.find_one(
                MetadataDB.id == ObjectId(metadata_in.metadata_id)
            )
            if existing:
                content = await validate_context(
                    metadata_in.content,
                    existing.definition,
                    existing.context_url,
                    existing.context,
                )
                query["_id"] = metadata_in.metadata_id
        else:
            # Use provided definition name as filter (don't validate yet, as patched data doesn't require completeness)
            # TODO: Should context_url also be unique to the file version?
            definition = metadata_in.definition
            if definition is not None:
                query["definition"] = definition

        # Filter by MetadataAgent
        if metadata_in.extractor is not None:
            listener = EventListenerDB.find_one(
                EventListenerDB.name == metadata_in.extractor.name,
                EventListenerDB.version == metadata_in.extractor.version,
            )
            if listener:
                agent = MetadataAgent(creator=user, listener=listener)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query["agent.listener.name"] = agent.listener.name
                query["agent.listener.version"] = agent.listener.version
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query["agent.creator.id"] = agent.creator.id

        md = await MetadataDB.find_one(query)
        if md:
            # TODO: Refactor this with permissions checks etc.
            return await patch_metadata(md, content, es)
        else:
            raise HTTPException(
                status_code=404, detail=f"Metadata matching the query not found"
            )
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/metadata", response_model=List[MetadataOut])
async def get_dataset_metadata(
    dataset_id: str,
    listener_name: Optional[str] = Form(None),
    listener_version: Optional[float] = Form(None),
    user=Depends(get_current_user),
    allow: bool = Depends(Authorization("viewer")),
):
    dataset = await DatasetDB.get(dataset_id)
    if dataset is not None:
        query = {"resource.resource_id": ObjectId(dataset_id)}
        if listener_name is not None:
            query["agent.listener.name"] = listener_name
        if listener_version is not None:
            query["agent.listener.version"] = listener_version

        metadata = []
        for md in await MetadataDB.find(query):
            # TODO: Can this be accomplished with a view?
            if md.definition is not None:
                md_def = MetadataDefinitionDB.find_one(
                    MetadataDefinitionDB.name == md.definition
                )
                if md_def:
                    md.description = md_def.description
            metadata.append(md)
        return metadata
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.delete("/{dataset_id}/metadata", response_model=MetadataOut)
async def delete_dataset_metadata(
    metadata_in: MetadataDelete,
    dataset_id: str,
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    dataset = await DatasetDB.get(dataset_id)
    if dataset:
        # filter by metadata_id or definition
        query = {"resource.resource_id": ObjectId(dataset_id)}
        if metadata_in.metadata_id is not None:
            # If a specific metadata_id is provided, delete the matching entry
            existing = await MetadataDB.find_one(
                MetadataDB.id == ObjectId(metadata_in.metadata_id)
            )
            if existing:
                query["metadata_id"] = metadata_in.metadata_id
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"Metadata id {metadata_in.metadata_id} not found",
                )
        else:
            # Use provided definition name as filter
            # TODO: Should context_url also be unique to the file version?
            definition = metadata_in.definition
            if definition is not None:
                query["definition"] = definition

        # Filter by MetadataAgent
        extractor_info = metadata_in.extractor_info
        if extractor_info is not None:
            listener = EventListenerDB.find_one(
                EventListenerDB.name == metadata_in.extractor.name,
                EventListenerDB.version == metadata_in.extractor.version,
            )
            if listener:
                agent = MetadataAgent(creator=user, listener=listener)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query["agent.listener.name"] = agent.listener.name
                query["agent.listener.version"] = agent.listener.version
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query["agent.creator.id"] = agent.creator.id

        # delete from elasticsearch
        delete_document_by_id(es, "metadata", str(metadata_in.id))

        md = MetadataDB.find_one(query)
        if md:
            return await md.delete()
        else:
            raise HTTPException(
                status_code=404, detail=f"No metadata found with that criteria"
            )
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
