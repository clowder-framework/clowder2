from datetime import datetime

from pydantic import Field

from app.models.mongomodel import MongoModel
from app.models.users import UserOut


class APIKeyBase(MongoModel):
    name: str
    user: UserOut
    hash: str
    created: datetime = Field(default_factory=datetime.utcnow)


class APIKeyPOST(MongoModel):
    name: str


class APIKeyCreate():
    name: str
    key: str


class APIKeyGET(APIKeyBase):
    pass
