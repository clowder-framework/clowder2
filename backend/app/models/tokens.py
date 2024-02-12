import pymongo
from app.models.mongomodel import BaseModel
from beanie import Document


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
