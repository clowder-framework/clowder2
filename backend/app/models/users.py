from datetime import datetime
from typing import Optional

from beanie import Document
from passlib.context import CryptContext
from pydantic import Field, EmailStr, BaseModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    admin: bool = False


class UserIn(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserDoc(Document, UserBase):
    class Settings:
        name = "users"


class UserDB(UserDoc):
    hashed_password: str = Field()
    keycloak_id: Optional[str] = None

    def verify_password(self, password):
        return pwd_context.verify(password, self.hashed_password)


class UserOut(UserDoc):
    class Config:
        fields = {"id": "id"}


class UserAPIKeyBase(BaseModel):
    """API keys can have a reference name (e.g. 'Uploader script')"""

    name: str
    key: str
    user: EmailStr
    created: datetime = Field(default_factory=datetime.utcnow)
    expires: Optional[datetime] = None


class UserAPIKeyDB(Document, UserAPIKeyBase):
    class Settings:
        name = "user_keys"


class UserAPIKeyOut(UserAPIKeyDB):
    class Config:
        fields = {"id": "id"}


class ListenerAPIKeyBase(UserAPIKeyBase):
    """API key per user that will be sent to extractors, stored separately."""

    hash: str


class ListenerAPIKeyDB(Document, ListenerAPIKeyBase):
    class Settings:
        name = "listener_keys"
