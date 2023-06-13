import pymongo
from beanie import Document
from pydantic import BaseModel


class ConfigEntryBase(BaseModel):
    key: str
    value: str


class ConfigEntryDB(Document, ConfigEntryBase):
    class Settings:
        name = "config"
        indexes = [
            [
                ("key", pymongo.TEXT),
            ],
        ]


class ConfigEntryOut(ConfigEntryDB):
    pass
