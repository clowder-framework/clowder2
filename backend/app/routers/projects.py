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
from app.models.users import UserDB, UserOut, UserIn
from app.models.datasets import DatasetDB
from app.models.files import FileDB
from app.models.folders import FolderDB
from app.models.project import (
    ProjectBase,
    ProjectDB,
    ProjectIn,
    ProjectOut,
    Member,
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
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    project = ProjectDB(**project_in.dict())
    await project.insert()

    # TODO Add new entry to elasticsearch
    return project.dict()


@router.post("/{project_id}/add_dataset/{dataset_id}", response_model=ProjectOut)
async def add_dataset(
    project_id: str,
    dataset_id: str,
):
    if (
        project := await ProjectDB.find_one(
            Or(
                ProjectDB.id == PydanticObjectId(project_id),
            )
        )
    ) is not None:
        if (
            dataset := await DatasetDB.find_one(
                Or(
                    DatasetDB.id == PydanticObjectId(dataset_id),
                )
            )
        ) is not None:
            if dataset_id not in project.dataset_ids:
                project.dataset_ids.append(PydanticObjectId(dataset_id))
                await project.replace()
            return project.dict()
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")


@router.post("/{project_id}/remove_dataset/{dataset_id}", response_model=ProjectOut)
async def remove_dataset(
    project_id: str,
    dataset_id: str,
):
    if (
        project := await ProjectDB.find_one(
            Or(
                ProjectDB.id == PydanticObjectId(project_id),
            )
        )
    ) is not None:
        if (
            dataset := await DatasetDB.find_one(
                Or(
                    DatasetDB.id == PydanticObjectId(dataset_id),
                )
            )
        ) is not None:
            if dataset_id in project.dataset_ids:
                project.dataset_ids.remove(PydanticObjectId(dataset_id))
                await project.replace()
                return project.dict()
            else:
                return project.dict()
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")


@router.post("/{project_id}/add_folder/{folder_id}", response_model=ProjectOut)
async def add_folder(
    project_id: str,
    folder_id: str,
):
    if (
        project := await ProjectDB.find_one(
            Or(
                ProjectDB.id == PydanticObjectId(project_id),
            )
        )
    ) is not None:
        if (
            folder := await FolderDB.find_one(
                Or(
                    FolderDB.id == FolderDB(PydanticObjectId(folder_id)),
                )
            )
        ) is not None:
            if folder_id not in project.folder_ids:
                project.folder_ids.append(PydanticObjectId(folder_id))
                await project.replace()
            return project.dict()
        raise HTTPException(status_code=404, detail=f"Folder {folder_id} not found")
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")


@router.post("/{project_id}/remove_folder/{folder_id}", response_model=ProjectOut)
async def remove_folder(
    project_id: str,
    folder_id: str,
):
    if (
        project := await ProjectDB.find_one(
            Or(
                ProjectDB.id == PydanticObjectId(project_id),
            )
        )
    ) is not None:
        if (
            folder := await FolderDB.find_one(
                Or(
                    FolderDB.id == FolderDB(PydanticObjectId(folder_id)),
                )
            )
        ) is not None:
            if folder_id in project.folder_ids:
                project.folder_ids.remove(PydanticObjectId(folder_id))
                await project.replace()
                return project.dict()
            else:
                return project.dict()
        raise HTTPException(status_code=404, detail=f"Folder {folder_id} not found")
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")


@router.post("/{project_id}/add_file/{file_id}", response_model=ProjectOut)
async def add_file(
    project_id: str,
    file_id: str,
):
    if (
        project := await ProjectDB.find_one(
            Or(
                ProjectDB.id == PydanticObjectId(project_id),
            )
        )
    ) is not None:
        if (
            file := await FolderDB.find_one(
                Or(
                    FileDB.id == FileDB(PydanticObjectId(file_id)),
                )
            )
        ) is not None:
            if file_id not in project.file_ids:
                project.file_ids.append(PydanticObjectId(file_id))
                await project.replace()
            return project.dict()
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")


@router.post("/{project_id}/remove_file/{file_id}", response_model=ProjectOut)
async def remove_file(
    project_id: str,
    file_id: str,
):
    if (
        project := await ProjectDB.find_one(
            Or(
                ProjectDB.id == PydanticObjectId(project_id),
            )
        )
    ) is not None:
        if (
            file := await FolderDB.find_one(
                Or(
                    FileDB.id == FileDB(PydanticObjectId(file_id)),
                )
            )
        ) is not None:
            if file_id in project.file_ids:
                project.file_ids.remove(PydanticObjectId(file_id))
                await project.replace()
                return project.dict()
            else:
                return project.dict()
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")


@router.get("", response_model=Paged)
async def get_projects(
    user_id=Depends(get_user),
    skip: int = 0,
    limit: int = 10,
    mine: bool = False,
    enable_admin: bool = False,
):
    # TODO check if the current user is a member OR creator
    projects_and_count = await ProjectDB.aggregate(
        [_get_page_query(skip, limit, sort_field="email", ascending=True)],
    ).to_list()

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
    if (
        project := await ProjectDB.find_one(
            Or(
                ProjectDB.id == PydanticObjectId(project_id),
            )
        )
    ) is not None:
        return project.dict()
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")


@router.delete("/{project_id}", response_model=ProjectOut)
async def delete_project(
    project_id: str,
):
    if (project := await ProjectDB.get(PydanticObjectId(project_id))) is not None:
        await project.delete()
        return project.dict()  # TODO: Do we need to return what we just deleted?
    else:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")


@router.post("/{project_id}/add_member/{username}", response_model=ProjectOut)
async def add_member(
    project_id: str,
    username: str,
    role: Optional[str] = None,
):
    """Add a new user to a group."""
    if (user := await UserDB.find_one(UserDB.email == username)) is not None:
        new_member = Member(user=UserOut(**user.dict()))
        if (project := await ProjectDB.get(PydanticObjectId(project_id))) is not None:
            found_already = False
            for u in project.users:
                if u.user.email == username:
                    found_already = True
                    break
            if not found_already:
                # If user is already in the group, skip directly to returning the group
                # else add role and attach this member
                project.users.append(new_member)
                await project.replace()
            return project.dict()
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    raise HTTPException(status_code=404, detail=f"User {username} not found")


@router.post("/{project_id}/remove_member/{username}", response_model=ProjectOut)
async def remove_member(
    project_id: str,
    username: str,
):
    """Remove a user from a group."""

    if (project := await ProjectDB.get(PydanticObjectId(project_id))) is not None:
        # Is the user actually in the group already?
        found_user = None
        for u in project.users:
            if u.user.email == username:
                found_user = u
        if not found_user:
            # TODO: User wasn't in group, should this throw an error instead? Either way, the user is removed...
            return project
        # Update group itself
        project.users.remove(found_user)
        await project.replace()
        return project.dict()
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
