from datetime import datetime
from pydantic import Field, BaseModel
from typing import Optional, List, Union
from app.models.mongomodel import MongoModel
from app.models.users import UserOut
from app.models.search import SearchObject
from app.models.listeners import EventListenerOut, FeedListener


class JobFeed(BaseModel):
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
