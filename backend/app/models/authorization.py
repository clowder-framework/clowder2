from datetime import datetime
from enum import Enum
from app.models.pyobjectid import PyObjectId

from pydantic import BaseModel, EmailStr, Field

from app.models.mongomodel import MongoModel


class RoleType(str, Enum):
    """A user can have one of the following roles for a specific dataset. Since we don't currently implement permissions
    there is an implied hierarchy between these roles OWNER > EDITOR > UPLOADER > VIEWER. For example, if a route
    requires VIEWER any of the roles can access that resource."""

    OWNER = "owner"
    VIEWER = "viewer"
    UPLOADER = "uploader"
    EDITOR = "editor"


class AuthorizationBase(BaseModel):
    # TODO: This should be PyObjectId = Field(default_factory=PyObjectId). Need to figure out why can't create instance
    #  in `routers.authorization.get_dataset_role()`.
    dataset_id: PyObjectId
    user_id: EmailStr
    role: RoleType

    class Config:
        # required for Enum to properly work
        use_enum_values = True


class AuthorizationFile(BaseModel):
    # TODO: This should be PyObjectId = Field(default_factory=PyObjectId). Need to figure out why can't create instance
    #  in `routers.authorization.get_dataset_role()`.
    file_id: PyObjectId
    user_id: EmailStr
    role: RoleType

    class Config:
        # required for Enum to properly work
        use_enum_values = True


class Provenance(BaseModel):
    """Store user who created model, when and last time it was updated.
    TODO: this generic model should be moved to a global util module in models for all those models that want to
     store basic provenance.
    """

    creator: EmailStr
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)


class AuthorizationDB(MongoModel, AuthorizationBase, Provenance):
    pass
