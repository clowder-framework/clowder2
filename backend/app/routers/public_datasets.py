import datetime
import hashlib
import io
import os
import shutil
import tempfile
import zipfile
from collections.abc import Mapping, Iterable
from typing import List, Optional

from beanie import PydanticObjectId
from beanie.operators import Or
from beanie.odm.operators.update.general import Inc
from bson import ObjectId
from bson import json_util
from elasticsearch import Elasticsearch
from fastapi import Form
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    Security,
    File,
    UploadFile,
    Request,
)
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
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from minio import Minio
from pika.adapters.blocking_connection import BlockingChannel
from rocrate.model.person import Person
from rocrate.rocrate import ROCrate

from app import dependencies
from app.config import settings
from app.deps.authorization_deps import Authorization
from app.keycloak_auth import (
    get_token,
    get_user,
    get_current_user,
)
from app.models.authorization import AuthorizationDB, RoleType
from app.models.datasets import (
    DatasetBase,
    DatasetIn,
    DatasetDB,
    DatasetOut,
    DatasetPatch,
    DatasetDBViewList,
    DatasetStatus,
)
from app.models.files import FileOut, FileDB, FileDBViewList
from app.models.folders import FolderOut, FolderIn, FolderDB, FolderDBViewList
from app.models.metadata import MetadataDB
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut
from app.models.thumbnails import ThumbnailDB
from app.rabbitmq.listeners import submit_dataset_job
from app.routers.files import add_file_entry, remove_file_entry
from app.search.connect import (
    delete_document_by_id,
)
from app.search.index import index_dataset

router = APIRouter()
security = HTTPBearer()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")

@router.get("", response_model=List[DatasetOut])
async def get_datasets(
    skip: int = 0,
    limit: int = 10,
):
    query = [
        DatasetDB.status == DatasetStatus.PUBLIC
    ]
    datasets = await DatasetDB.find(*query).skip(skip).limit(limit).to_list()
    print(str(datasets))
    return [dataset.dict() for dataset in datasets]

@router.get("/{dataset_id}", response_model=DatasetOut)
async def get_dataset(
    dataset_id: str,
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if dataset.status == DatasetStatus.PUBLIC.name:
            return dataset.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")

@router.get("/{dataset_id}/files", response_model=List[FileOut])
async def get_dataset_files(
    dataset_id: str,
    folder_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if dataset.status == DatasetStatus.PUBLIC.name:
            query = [
                FileDBViewList.dataset_id == ObjectId(dataset_id),
            ]
            if folder_id is not None:
                query.append(FileDBViewList.folder_id == ObjectId(folder_id))
            files = await FileDBViewList.find(*query).skip(skip).limit(limit).to_list()
            return [file.dict() for file in files]
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")

@router.get("/{dataset_id}/folders", response_model=List[FolderOut])
async def get_dataset_folders(
    dataset_id: str,
    parent_folder: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if dataset.status == DatasetStatus.PUBLIC.name:
            query = [
                FolderDBViewList.dataset_id == ObjectId(dataset_id),
            ]
            if parent_folder is not None:
                query.append(FolderDBViewList.parent_folder == ObjectId(parent_folder))
            else:
                query.append(FolderDBViewList.parent_folder == None)
            folders = await FolderDBViewList.find(*query).skip(skip).limit(limit).to_list()
            return [folder.dict() for folder in folders]
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/metadata", response_model=List[MetadataOut])
async def get_dataset_metadata(
    dataset_id: str,
    listener_name: Optional[str] = Form(None),
    listener_version: Optional[float] = Form(None),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if dataset.status == DatasetStatus.PUBLIC.name:
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
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
