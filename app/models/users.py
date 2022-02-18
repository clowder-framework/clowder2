from typing import Optional

from passlib.context import CryptContext
from pydantic import Field, EmailStr

from app.models.mongomodel import MongoModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserBase(MongoModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserIn(UserBase):
    password: str


class UserDB(UserBase):
    hashed_password: str = Field()

    def verify_password(self, password):
        return pwd_context.verify(password, self.hashed_password)


class UserOut(UserBase):
    pass
