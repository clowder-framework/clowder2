from datetime import datetime
from typing import Optional

from beanie import Document
from passlib.context import CryptContext
from pydantic import Field, EmailStr, BaseModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserBase(BaseModel):
    email: EmailStr


class UserIn(UserBase):
    first_name: str
    last_name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserDB(Document, UserBase):
    first_name: str
    last_name: str
    hashed_password: str = Field()
    keycloak_id: Optional[str] = None

    def verify_password(self, password):
        return pwd_context.verify(password, self.hashed_password)

    class Settings:
        name = "users"


class UserOut(UserBase):
    first_name: str
    last_name: str

    class Config:
        fields = {"id": "id"}


class UserAPIKeyBase(BaseModel):
    """API keys can have a reference name (e.g. 'Uploader script')"""

    key: str
    name: str
    user: EmailStr
    created: datetime = Field(default_factory=datetime.utcnow)
    expires: Optional[datetime] = None


class UserAPIKeyDB(Document, UserAPIKeyBase):
    class Settings:
        name = "user_keys"


class UserAPIKeyOut(UserAPIKeyDB):
    class Config:
        fields = {"id": "id"}
