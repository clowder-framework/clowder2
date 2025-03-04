import os
from typing import Optional

from beanie import PydanticObjectId
from beanie.operators import Or
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer

from app.deps.authorization_deps import Authorization, ProjectAuthorization
from app.keycloak_auth import get_current_user, get_user
from app.models.datasets import DatasetDB
from app.models.groups import GroupDB, Member, GroupType
from app.models.pages import Paged, _construct_page_metadata, _get_page_query
from app.models.projects import ProjectDB, ProjectIn, ProjectOut
from app.models.users import UserDB, UserOut

router = APIRouter()
security = HTTPBearer()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


@router.post("", response_model=ProjectOut)
async def save_project(
        project_in: ProjectIn,
        user=Depends(get_current_user),
):
    project = ProjectDB(**project_in.dict(), creator=user)
    await project.insert()

    # Automatically create viewer and editor groups to go with this project
    viewer_group = GroupDB(**{
        "name": project.name + " (Viewers)",
        "description": f"Automatically created for viewers of {project.name} project.",
        "users": [],
        "project_id": project.id,
        "type": GroupType.PROJECT
    }, creator=user.email)
    await viewer_group.insert()

    editor_group = GroupDB(**{
        "name": project.name + " (Editors)",
        "description": f"Automatically created for editors of {project.name} project.",
        "users": [
            {"user": user, "editor": True}
        ],
        "project_id": str(project.id),
        "type": GroupType.PROJECT
    }, creator=user.email)
    await editor_group.insert()

    project.viewers_group_id = viewer_group.id
    project.editors_group_id = editor_group.id
    await project.save()

    return project.dict()


@router.post("/{project_id}/add_dataset/{dataset_id}", response_model=ProjectOut)
async def add_dataset(
        project_id: str,
        dataset_id: str,
        allow_proj: bool = Depends(ProjectAuthorization("editor")),
        allow_ds: bool = Depends(Authorization("viewer")),
):
    if (project := await ProjectDB.get(PydanticObjectId(project_id))) is not None:
        if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
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
        role: Optional[str] = "viewer",
        allow: bool = Depends(ProjectAuthorization("editor")),
):
    """Add a new user to the project individually - this is routed to one of the project's hidden groups."""
    if (user := await UserDB.find_one(UserDB.email == username)) is not None:
        # Add to viewers group if role is none, otherwise add to appropriate group
        new_member = Member(user=UserOut(**user.dict()), editor=(role == "editor"))
        if (project := await ProjectDB.get(PydanticObjectId(project_id))) is not None:
            viewers_group = await GroupDB.get(PydanticObjectId(project.viewers_group_id))
            editors_group = await GroupDB.get(PydanticObjectId(project.editors_group_id))

            if role == "viewer":
                found_in_viewers = False
                for u in viewers_group.users:
                    if u.user.email == username:
                        found_in_viewers = True
                        break
                if not found_in_viewers:
                    viewers_group.users.append(new_member)
                    await viewers_group.save()

                found_in_editors = False
                clean_users = []
                for u in editors_group.users:
                    if u.user.email == username:
                        found_in_editors = True
                    else:
                        clean_users.append(u)
                if found_in_editors:
                    editors_group.users = clean_users
                    await editors_group.save()

            elif role == "editor":
                found_in_editors = False
                for u in editors_group.users:
                    if u.user.email == username:
                        found_in_editors = True
                        break
                if not found_in_editors:
                    editors_group.users.append(new_member)
                    await editors_group.save()

                found_in_viewers = False
                clean_users = []
                for u in viewers_group.users:
                    if u.user.email == username:
                        found_in_viewers = True
                    else:
                        clean_users.append(u)
                if found_in_viewers:
                    viewers_group.users = clean_users
                    await viewers_group.save()

            return project.dict()
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    raise HTTPException(status_code=404, detail=f"User {username} not found")


@router.post("/{project_id}/remove_member/{username}", response_model=ProjectOut)
async def remove_member(
        project_id: str,
        username: str,
        allow: bool = Depends(ProjectAuthorization("editor")),
):
    """Remove a user from a group."""

    if (project := await ProjectDB.get(PydanticObjectId(project_id))) is not None:
        viewers_group = await GroupDB.get(PydanticObjectId(project.viewers_group_id))
        editors_group = await GroupDB.get(PydanticObjectId(project.editors_group_id))

        found_in_editors = False
        clean_users = []
        for u in editors_group.users:
            if u.user.email == username:
                found_in_editors = True
            else:
                clean_users.append(u)
        if found_in_editors:
            editors_group.users = clean_users
            await editors_group.save()

        found_in_viewers = False
        clean_users = []
        for u in viewers_group.users:
            if u.user.email == username:
                found_in_viewers = True
            else:
                clean_users.append(u)
        if found_in_viewers:
            viewers_group.users = clean_users
            await viewers_group.save()

        return project.dict()
    raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
