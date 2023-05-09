from typing import List

import pymongo
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

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


class FeedDB(Document, JobFeed, Provenance):
    id: PydanticObjectId = Field(None, alias="_id")

    class Settings:
        name = "feeds"
        indexes = [
            [
                ("name", pymongo.TEXT),
                ("description", pymongo.TEXT),
            ],
        ]


class FeedOut(FeedDB):
    pass
