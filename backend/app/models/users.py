from typing import Optional
from datetime import datetime
from passlib.context import CryptContext
from pydantic import Field, EmailStr, BaseModel

from app.models.mongomodel import MongoModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserBase(MongoModel):
    email: EmailStr


class UserIn(UserBase):
    first_name: str
    last_name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserDB(UserBase):
    first_name: str
    last_name: str
    hashed_password: str = Field()
    keycloak_id: Optional[str] = None

    def verify_password(self, password):
        return pwd_context.verify(password, self.hashed_password)


class UserOut(UserBase):
    first_name: str
    last_name: str


class UserAPIKey(MongoModel):
    """API keys can have a reference name (e.g. 'Uploader script')"""

    key: str
    user: EmailStr
    created: datetime = Field(default_factory=datetime.utcnow)
