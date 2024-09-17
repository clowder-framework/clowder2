import os
from typing import List, Optional

from app import dependencies
from app.config import settings
from app.deps.authorization_deps import Authorization
from app.keycloak_auth import UserOut, get_current_user
from app.models.datasets import DatasetDB, DatasetDBViewList, DatasetOut
from app.models.listeners import EventListenerDB
from app.models.metadata import (
    MetadataAgent,
    MetadataDB,
    MetadataDBViewList,
    MetadataDefinitionDB,
    MetadataDelete,
    MetadataIn,
    MetadataOut,
    MetadataPatch,
    MongoDBRef,
    patch_metadata,
    validate_context,
)
from app.search.connect import delete_document_by_id
from app.search.index import index_dataset
from beanie import PydanticObjectId
from bson import ObjectId
from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, Form, HTTPException

router = APIRouter()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


async def _build_metadata_db_obj(
    metadata_in: MetadataIn,
    dataset: DatasetOut,
    user: UserOut,
    agent: MetadataAgent = None,
):
    """Convenience function for converting MetadataIn to MetadataDB object."""
    content = await validate_context(
        metadata_in.content,
        metadata_in.definition,
        metadata_in.context_url,
        metadata_in.context,
    )

    if agent is None:
        # Build MetadataAgent depending on whether extractor info is present
        listener = metadata_in.listener
        if listener:
            agent = MetadataAgent(creator=user, listener=listener)
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

    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        # If dataset already has metadata using this definition, don't allow duplication
        query = []
        if metadata_in.definition is not None:
            query.append(MetadataDB.resource.resource_id == dataset.id)
            query.append(MetadataDB.definition == metadata_in.definition)

            # Extracted metadata doesn't care about user
            if metadata_in.listener is not None:
                query.append(
                    MetadataDB.agent.listener.name == metadata_in.listener.name
                )
                query.append(
                    MetadataDB.agent.listener.version == metadata_in.listener.version
                )
            else:
                query.append(MetadataDB.agent.creator.id == user.id)

            if (await MetadataDB.find_one(*query)) is not None:
                raise HTTPException(
                    409,
                    f"Metadata for {metadata_in.definition} already exists on this dataset",
                )

        md = await _build_metadata_db_obj(
            metadata_in, DatasetOut(**dataset.dict()), user
        )
        await md.insert()

        # Add an entry to the metadata index
        await index_dataset(es, DatasetOut(**dataset.dict()), update=True)
        return md.dict()


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
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        query = [MetadataDB.resource.resource_id == PydanticObjectId(dataset_id)]

        # Filter by MetadataAgent
        if metadata_in.listener is not None:
            listener = await EventListenerDB.find_one(
                EventListenerDB.name == metadata_in.listener.name,
                EventListenerDB.version == metadata_in.listener.version,
            )
            if listener:
                agent = MetadataAgent(creator=user, listener=listener)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query.append(MetadataDB.agent.listener.name == agent.listener.name)
                query.append(
                    MetadataDB.agent.listener.version == agent.listener.version
                )
            else:
                raise HTTPException(status_code=404, detail="Listener not found")
        else:
            agent = MetadataAgent(creator=user)
            query.append(MetadataDB.agent.creator.id == agent.creator.id)

        if (md := await MetadataDB.find_one(*query)) is not None:
            # Metadata exists, so prepare the new document we are going to replace it with
            new_md = await _build_metadata_db_obj(
                metadata_in, DatasetOut(**dataset.dict()), user, agent=agent
            )
            # keep the id but update every other fields
            tmp_md_id = md.id
            md = new_md
            md.id = tmp_md_id
            await md.replace()

            # Update entry to the metadata index
            await index_dataset(es, DatasetOut(**dataset.dict()), update=True)
            return md.dict()
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
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        query = [MetadataDB.resource.resource_id == PydanticObjectId(dataset_id)]
        content = metadata_in.content

        if metadata_in.metadata_id is not None:
            # If a specific metadata_id is provided, validate the patch against existing context
            if (
                existing := await MetadataDB.get(
                    PydanticObjectId(metadata_in.metadata_id)
                )
            ) is not None:
                content = await validate_context(
                    metadata_in.content,
                    existing.definition,
                    existing.context_url,
                    existing.context,
                )
                query.append(MetadataDB.id == metadata_in.metadata_id)
        else:
            # Use provided definition name as filter (don't validate yet, as patched data doesn't require completeness)
            # TODO: Should context_url also be unique to the file version?
            definition = metadata_in.definition
            if definition is not None:
                query.append(MetadataDB.definition == definition)

        # Filter by MetadataAgent
        if metadata_in.listener is not None:
            listener = await EventListenerDB.find_one(
                EventListenerDB.name == metadata_in.listener.name,
                EventListenerDB.version == metadata_in.listener.version,
            )
            if listener:
                agent = MetadataAgent(creator=user, listener=listener)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query.append(MetadataDB.agent.listener.name == agent.listener.name)
                query.append(
                    MetadataDB.agent.listener.version == agent.listener.version
                )
            else:
                raise HTTPException(status_code=404, detail="Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query.append(MetadataDB.agent.creator.id == agent.creator.id)

        md = await MetadataDB.find_one(*query)
        if md is not None:
            patched_metadata = await patch_metadata(md, content, es)
            await index_dataset(es, DatasetOut(**dataset.dict()), update=True)
            return patched_metadata
        else:
            raise HTTPException(
                status_code=404, detail="Metadata matching the query not found"
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
    if (
        await DatasetDBViewList.find_one(
            DatasetDBViewList.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        query = [
            MetadataDBViewList.resource.resource_id == PydanticObjectId(dataset_id)
        ]

        if listener_name is not None:
            query.append(MetadataDBViewList.agent.listener.name == listener_name)
        if listener_version is not None:
            query.append(MetadataDBViewList.agent.listener.version == listener_version)

        metadata = []
        async for md in MetadataDBViewList.find(*query):
            if md.definition is not None:
                if (
                    md_def := await MetadataDefinitionDB.find_one(
                        MetadataDefinitionDB.name == md.definition
                    )
                ) is not None:
                    md.description = md_def.description
            metadata.append(md)
        return [md.dict() for md in metadata]
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
    if (await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        # filter by metadata_id or definition
        query = [MetadataDB.resource.resource_id == PydanticObjectId(dataset_id)]
        if metadata_in.metadata_id is not None:
            # If a specific metadata_id is provided, delete the matching entry
            if (
                await MetadataDB.find_one(
                    MetadataDB.metadata_id == PydanticObjectId(metadata_in.metadata_id)
                )
            ) is not None:
                query.append(MetadataDB.metadata_id == metadata_in.metadata_id)
        else:
            # Use provided definition name as filter
            # TODO: Should context_url also be unique to the file version?
            definition = metadata_in.definition
            if definition is not None:
                query.append(MetadataDB.definition == definition)

        # Filter by MetadataAgent
        if metadata_in.listener is not None:
            listener = await EventListenerDB.find_one(
                EventListenerDB.name == metadata_in.listener.name,
                EventListenerDB.version == metadata_in.listener.version,
            )
            if listener:
                agent = MetadataAgent(creator=user, listener=listener)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query.append(MetadataDB.agent.listener.name == agent.listener.name)
                query.append(
                    MetadataDB.agent.listener.version == agent.listener.version
                )
            else:
                raise HTTPException(status_code=404, detail="Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query.append(MetadataDB.agent.creator.id == agent.creator.id)

        # delete from elasticsearch
        delete_document_by_id(
            es, settings.elasticsearch_index, str(metadata_in.metadata_id)
        )

        md = await MetadataDB.find_one(*query)
        if md is not None:
            await md.delete()
            return md.dict()  # TODO: Do we need to return what we just deleted?
        else:
            raise HTTPException(
                status_code=404, detail="No metadata found with that criteria"
            )
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
