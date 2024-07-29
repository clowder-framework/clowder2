import datetime
import hashlib
import io
import os
import shutil
import tempfile
import zipfile
from collections.abc import Iterable, Mapping
from typing import List, Optional
from app.models.pages import Paged, _construct_page_metadata, _get_page_query


from app import dependencies
from app.config import settings

from app.models.project import (
    ProjectBase,
    ProjectDB,
    ProjectIn,
    ProjectOut,
)
from app.keycloak_auth import get_current_user, get_token, get_user
from beanie import PydanticObjectId
from beanie.operators import And, Or
from bson import ObjectId, json_util
from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer
from minio import Minio
from pika.adapters.blocking_connection import BlockingChannel
from pymongo import DESCENDING
from rocrate.model.person import Person
from rocrate.rocrate import ROCrate

router = APIRouter()
security = HTTPBearer()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")

@router.post("", response_model=ProjectOut)
async def save_project(
    project_in: ProjectIn,
    license_id: str,
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):

    project = ProjectDB(
        **project_in.dict(),
        creator=user,
    )
    await project.insert()

    # TODO Add new entry to elasticsearch
    return project.dict()

@router.get("", response_model=Paged)
async def get_projects(
    user_id=Depends(get_user),
    skip: int = 0,
    limit: int = 10,
    mine: bool = False,
    enable_admin: bool = False,
):

    # TODO check if the current user is a member OR creator
    query = (ProjectDB.creator.email == user_id)

    projects_and_count = await ProjectDB.find(*query).to_list()

    page_metadata = _construct_page_metadata(projects_and_count, skip, limit)
    # TODO have to change _id this way otherwise it won't work
    # TODO need to research if there is other pydantic trick to make it work

    page = Paged(
        metadata=page_metadata,
        data=[
            ProjectOut(id=item.pop("_id"), **item)
            for item in projects_and_count[0]["data"]
        ],
    )

    return page.dict()

@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: str,
):
    if project := await ProjectDB.find_one(ProjectDB.id == PydanticObjectId(project_id)
            ) is not None:
        return project.dict()
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")