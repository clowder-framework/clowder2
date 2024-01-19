from datetime import datetime
from enum import Enum

from beanie import Document, PydanticObjectId
from charset_normalizer.md import List
from pydantic import BaseModel, EmailStr, Field


class RoleType(str, Enum):
    """A user can have one of the following roles for a specific dataset. Since we don't currently implement permissions
    there is an implied hierarchy between these roles OWNER > EDITOR > UPLOADER > VIEWER. For example, if a route
    requires VIEWER any of the roles can access that resource."""

    OWNER = "owner"
    VIEWER = "viewer"
    UPLOADER = "uploader"
    EDITOR = "editor"


class Provenance(BaseModel):
    """Store user who created model, when and last time it was updated.
    TODO: this generic model should be moved to a global util module in models for all those models that want to
     store basic provenance.
    """

    creator: EmailStr
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)


class AuthorizationBase(BaseModel):
    """Currently, user_ids list is used for primary authorization checks.
    group_ids are kept for convenience (adding/removing users in batch) but user_ids list MUST be kept current.
    """

    dataset_id: PydanticObjectId
    user_ids: List[EmailStr] = []
    role: RoleType
    group_ids: List[PydanticObjectId] = []

    class Config:
        # required for Enum to properly work
        use_enum_values = True


class AuthorizationDB(Document, AuthorizationBase, Provenance):
    """The creator of the Authorization object should also be the creator of the dataset itself."""

    class Settings:
        name = "authorization"


class AuthorizationOut(AuthorizationDB):
    class Config:
        fields = {"id": "id"}


class AuthorizationFile(BaseModel):
    # TODO: This should be PyObjectId = Field(default_factory=PyObjectId). Need to figure out why can't create instance
    #  in `routers.authorization.get_dataset_role()`.
    file_id: PydanticObjectId
    user_ids: List[EmailStr] = []
    role: RoleType
    group_ids: List[PydanticObjectId] = []

    class Config:
        # required for Enum to properly work
        use_enum_values = True


class AuthorizationMetadata(BaseModel):
    metadata_id: PydanticObjectId
    user_id: EmailStr
    role: RoleType

    class Config:
        # required for Enum to properly work
        use_enum_values = True
