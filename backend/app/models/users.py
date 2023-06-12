from datetime import datetime
from typing import Optional

from passlib.context import CryptContext
from pydantic import Field, EmailStr, BaseModel
from pymongo import MongoClient

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

    name: str
    key: str
    name: str
    user: EmailStr
    created: datetime = Field(default_factory=datetime.utcnow)
    expires: Optional[datetime] = None


class ListenerAPIKey(UserAPIKey):
    """API key per user that will be sent to extractors, stored separately."""

    hash: str


class UserAPIKeyOut(MongoModel):
    # don't show the raw key
    name: str
    user: EmailStr
    created: datetime = Field(default_factory=datetime.utcnow)
    expires: Optional[datetime] = None


async def get_user_out(user_id: str, db: MongoClient) -> UserOut:
    """Retrieve user from Mongo based on email address."""
    user_out = await db["users"].find_one({"email": user_id})
    return UserOut.from_mongo(user_out)
