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

from datetime import datetime
from typing import Optional

from app import dependencies
from app.deps.authorization_deps import AuthorizationDB, GroupAuthorization
from app.keycloak_auth import get_current_user, get_user
from app.models.authorization import RoleType
from app.models.datasets import DatasetDB, DatasetOut
from app.models.groups import GroupBase, GroupDB, GroupIn, GroupOut, Member
from app.models.pages import Paged, _construct_page_metadata, _get_page_query
from app.models.users import UserDB, UserOut
from app.routers.authentication import get_admin, get_admin_mode
from app.search.index import index_dataset, index_dataset_files
from beanie import PydanticObjectId
from beanie.operators import Or, Push, RegEx
from bson.objectid import ObjectId
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()


@router.post("", response_model=GroupOut)
async def save_group(
    group_in: GroupIn,
    user=Depends(get_current_user),
):
    group_db = GroupDB(**group_in.dict(), creator=user.email)
    user_member = Member(user=user, editor=True)
    if user_member not in group_db.users:
        group_db.users.append(user_member)
    await group_db.insert()
    return group_db.dict()


@router.get("", response_model=Paged)
async def get_groups(
    user_id=Depends(get_user),
    skip: int = 0,
    limit: int = 10,
    enable_admin: bool = False,
    admin_mode: bool = Depends(get_admin_mode),
    admin=Depends(get_admin),
):
    """Get a list of all Groups in the db the user is a member/owner of.

    Arguments:
        skip -- number of initial recoto_list()rds to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)


    """
    criteria_list = []
    if not admin or not admin_mode:
        criteria_list.append(
            Or(
                GroupDB.creator == user_id,
                GroupDB.users.user.email == user_id,
            )
        )

    groups_and_count = (
        await GroupDB.find(
            *criteria_list,
        )
        .aggregate(
            [_get_page_query(skip, limit, sort_field="created", ascending=False)],
        )
        .to_list()
    )
    page_metadata = _construct_page_metadata(groups_and_count, skip, limit)
    page = Paged(
        metadata=page_metadata,
        data=[
            GroupOut(id=item.pop("_id"), **item) for item in groups_and_count[0]["data"]
        ],
    )
    return page.dict()


@router.get("/search/{search_term}", response_model=Paged)
async def search_group(
    search_term: str,
    user_id=Depends(get_user),
    skip: int = 0,
    limit: int = 10,
    enable_admin: bool = False,
    admin_mode: bool = Depends(get_admin_mode),
    admin=Depends(get_admin),
):
    """Search all groups in the db based on text.

    Arguments:
        text -- any text matching name or description
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
    """

    criteria_list = [
        Or(
            RegEx(field=GroupDB.name, pattern=search_term, options="i"),
            RegEx(field=GroupDB.description, pattern=search_term, options="i"),
        ),
    ]
    if not admin or not admin_mode:
        criteria_list.append(
            Or(GroupDB.creator == user_id, GroupDB.users.user.email == user_id)
        )

    # user has to be the creator or member first; then apply search
    groups_and_count = (
        await GroupDB.find(
            *criteria_list,
        )
        .aggregate(
            [_get_page_query(skip, limit, sort_field="created", ascending=False)],
        )
        .to_list()
    )
    page_metadata = _construct_page_metadata(groups_and_count, skip, limit)
    page = Paged(
        metadata=page_metadata,
        data=[
            GroupOut(id=item.pop("_id"), **item) for item in groups_and_count[0]["data"]
        ],
    )
    return page.dict()


@router.get("/{group_id}", response_model=GroupOut)
async def get_group(
    group_id: str,
    allow: bool = Depends(GroupAuthorization("viewer")),
):
    if (group := await GroupDB.get(PydanticObjectId(group_id))) is not None:
        return group.dict()
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.put("/{group_id}", response_model=GroupOut)
async def edit_group(
    group_id: str,
    group_info: GroupBase,
    user_id=Depends(get_user),
    allow: bool = Depends(GroupAuthorization("editor")),
):
    if (group := await GroupDB.get(PydanticObjectId(group_id))) is not None:
        group_dict = dict(group_info) if group_info is not None else {}

        if len(group_dict["name"]) == 0 or len(group_dict["users"]) == 0:
            raise HTTPException(
                status_code=400,
                detail="Group name can't be null or user list can't be empty",
            )
            return

        user = await UserDB.find_one(UserDB.email == user_id)
        group_dict["creator"] = user.dict()
        group_dict["modified"] = datetime.utcnow()
        groups_users = group_dict["users"]
        original_users = group.users

        # remove users that are no longer in this group
        for original_user in original_users:
            if original_user not in groups_users:
                # remove them from auth
                async for auth in AuthorizationDB.find(
                    {"group_ids": ObjectId(group_id)}
                ):
                    auth.user_ids.remove(original_user.user.email)
                    await auth.replace()
                    # Update group itself
                group.users.remove(original_user)
                await group.replace()
        # add new users to the group
        for i in range(0, len(groups_users)):
            user = groups_users[i]
            if user in group.users:
                for original_user in group.users:
                    if original_user.user.email == user.user.email:
                        original_editor = original_user.editor
                        new_editor = user.editor
                        # replace the user if editor has changed
                        if not new_editor == original_editor:
                            group.users.remove(original_user)
                            group.users.append(user)
                            await group.replace()
            else:
                # if user is not in the group add user
                group.users.append(user)
                await group.replace()
                # Add user to all affected Authorization entries
                await AuthorizationDB.find(
                    AuthorizationDB.group_ids == ObjectId(group_id),
                ).update(
                    Push({AuthorizationDB.user_ids: user.email}),
                )
        try:
            group.name = group_dict["name"]
            await group.replace()
            if "description" in group_dict:
                group.description = group_dict["description"]
                await group.replace()
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return group.dict()
    raise HTTPException(status_code=404, detail=f"Group {group_id} not found")


@router.delete("/{group_id}", response_model=GroupOut)
async def delete_group(
    group_id: str,
    allow: bool = Depends(GroupAuthorization("owner")),
):
    if (group := await GroupDB.get(PydanticObjectId(group_id))) is not None:
        await group.delete()
        return group.dict()  # TODO: Do we need to return what we just deleted?
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {group_id} not found")


@router.post("/{project_id}/add/{username}", response_model=ProjectOut)
async def add_member(
    project_id: str,
    username: str,
    role: Optional[str] = None,
    es=Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(GroupAuthorization("editor")),
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

                if role is not None and role == RoleType.EDITOR:
                    new_member.editor = True
                else:
                    new_member.editor = False
                project.users.append(new_member)
                await project.replace()
            return project.dict()
        raise HTTPException(status_code=404, detail=f"Group {project_id} not found")
    raise HTTPException(status_code=404, detail=f"User {username} not found")

@router.post("/{project_id}/remove/{username}", response_model=ProjectOut)
async def remove_member(
    project_id: str,
    username: str,
    es=Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(GroupAuthorization("editor")),
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
    raise HTTPException(status_code=404, detail=f"Group {project_id} not found")

