import os
from typing import List, Optional

from beanie import PydanticObjectId
from bson import ObjectId
from elasticsearch import Elasticsearch
from fastapi import APIRouter, HTTPException, Depends
from fastapi import Form

from app import dependencies
from app.config import settings
from app.deps.authorization_deps import Authorization
from app.keycloak_auth import get_current_user, UserOut
from app.models.datasets import DatasetOut, DatasetDB
from app.models.listeners import LegacyEventListenerIn, EventListenerDB
from app.models.metadata import (
    MongoDBRef,
    MetadataAgent,
    MetadataIn,
    MetadataDB,
    MetadataOut,
    MetadataPatch,
    validate_context,
    patch_metadata,
    MetadataDelete,
    MetadataDefinitionDB,
)
from app.search.connect import delete_document_by_id
from app.search.index import index_dataset

router = APIRouter()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


@router.get("/{dataset_id}/metadata", response_model=List[MetadataOut])
async def get_dataset_metadata(
    dataset_id: str,
    listener_name: Optional[str] = Form(None),
    listener_version: Optional[float] = Form(None),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        query = [MetadataDB.resource.resource_id == ObjectId(dataset_id)]

        if listener_name is not None:
            query.append(MetadataDB.agent.listener.name == listener_name)
        if listener_version is not None:
            query.append(MetadataDB.agent.listener.version == listener_version)

        metadata = []
        async for md in MetadataDB.find(*query):
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
