from mongoengine import connect
from passlib.context import CryptContext
from pydantic import BaseModel, Field

from app.models.mongomodel import MongoModel

DATABASE_URI = "mongodb://127.0.0.1:27017"
db = DATABASE_URI + "/clowder"
connect(host=db)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(MongoModel):
    name: str = Field()
    hashed_password: str = Field()

    def verify_password(self, password):
        return pwd_context.verify(password, self.hashed_password)


class AuthDetails(BaseModel):
    name: str
    password: str
