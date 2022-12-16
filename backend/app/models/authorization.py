from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId
from app.models.users import UserDB, UserOut


class RoleType(str, Enum):
    OWNER = "owner"
    VIEWER = "viewer"
    EDITOR = "editor"
    UPLOADER = "uploader"


class AuthorizationBase(BaseModel):
    dataset_id: PyObjectId
    user_id: EmailStr
    role: RoleType

    class Config:
        # required for Enum to properly work
        use_enum_values = True

class Provenance(BaseModel):
    creator: EmailStr
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)

class AuthorizationDB(MongoModel, AuthorizationBase, Provenance):
    pass