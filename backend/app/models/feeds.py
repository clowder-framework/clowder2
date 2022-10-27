from datetime import datetime
from pydantic import Field, BaseModel
from typing import Optional, List, Union
from app.models.mongomodel import MongoModel
from app.models.users import UserOut
from app.models.search import SearchObject
from app.models.listeners import EventListenerOut, FeedListener


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


class FeedDB(JobFeed, MongoModel):
    author: UserOut
    updated: datetime = Field(default_factory=datetime.utcnow)


class FeedOut(FeedDB):
    pass
