from typing import Optional

from passlib.context import CryptContext
from pydantic import Field, EmailStr
from pymongo import MongoClient

from app.models.mongomodel import MongoModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserBase(MongoModel):
    email: EmailStr
    first_name: str
    last_name: str


class UserIn(UserBase):
    password: str


class UserDB(UserBase):
    hashed_password: str = Field()
    keycloak_id: Optional[str] = None

    def verify_password(self, password):
        return pwd_context.verify(password, self.hashed_password)


class UserOut(UserBase):
    pass


async def get_user_out(user_id: str, db: MongoClient) -> UserOut:
    """Retrieve user from Mongo based on email address."""
    user_out = await db["users"].find_one({"email": user_id})
    return UserOut(**user_out)
