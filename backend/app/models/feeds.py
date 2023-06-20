from typing import List, Optional
from datetime import datetime

import pymongo
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field, EmailStr

from app.models.authorization import Provenance
from app.models.listeners import FeedListener
from app.models.search import SearchObject


class JobFeed(BaseModel):
    """A Job Feed is a saved set of search criteria with some number of Event Listeners that can be triggered when new
    resources match the saved search criteria for the Feed."""

    name: str
    search: SearchObject
    listeners: List[FeedListener] = []


class FeedBase(JobFeed):
    description: str = ""


class FeedIn(JobFeed):
    pass


class FeedDB(Document, JobFeed):
    creator: Optional[EmailStr]
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "feeds"
        indexes = [
            [
                ("name", pymongo.TEXT),
                ("description", pymongo.TEXT),
            ],
        ]


class FeedOut(FeedDB):
    class Config:
        fields = {"id": "id"}
