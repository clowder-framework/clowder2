from datetime import datetime
from typing import Optional, List

import pymongo
from beanie import Document
from pydantic import Field, BaseModel

from app.models.listeners import FeedListener
from app.models.search import SearchObject
from app.models.users import UserOut


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
    creator: Optional[UserOut] = None
    updated: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "feeds_beanie"
        indexes = [
            [
                ("name", pymongo.TEXT),
                ("description", pymongo.TEXT),
            ],
        ]


class FeedOut(FeedDB):
    pass
