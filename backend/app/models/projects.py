from datetime import datetime
from typing import List, Optional

from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

from app.models.groups import GroupOut
from app.models.users import UserOut


class ProjectMember(BaseModel):
    group: GroupOut
    editor: bool = False


class ProjectBase(BaseModel):
    """Projects handle their membership and permissions with a group that is created with the project.
    Members who are added to the project are added to this group. Other groups can also be added to the
    project, but this one is a special one tied to the project - it cannot be deleted unless the project
    is deleted (which deletes the associated group).

    """
    name: str
    description: Optional[str] = None
    # Individual users are added to one of the project's hidden groups (viewers or editors)
    viewers_group_id: Optional[PydanticObjectId] = None
    editors_group_id: Optional[PydanticObjectId] = None
    groups: List[ProjectMember] = []
    dataset_ids: List[PydanticObjectId] = []


class ProjectDB(Document, ProjectBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "projects"


class ProjectIn(ProjectBase):
    pass


class ProjectOut(ProjectDB):
    class Config:
        fields = {"id": "id"}
