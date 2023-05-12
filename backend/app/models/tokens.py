import pymongo
from beanie import Document

from app.models.mongomodel import BaseModel


class TokenBase(BaseModel):
    email: str
    refresh_token: str


class TokenDB(Document, TokenBase):
    class Settings:
        name = "tokens"
        indexes = [
            [
                ("email", pymongo.TEXT),
            ],
        ]
