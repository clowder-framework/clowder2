from datetime import datetime
from pydantic import Field, BaseModel
from typing import Optional, List, Union
from app.models.mongomodel import MongoModel
from app.models.users import UserOut
from app.models.listeners import ListenerOut, FeedListener


class SearchCriteria(BaseModel):
    field: str
    operator: str
    value: str


class JobFeed(BaseModel):
    name: str
    criteria: List[SearchCriteria] = []
    listeners: List[FeedListener] = []
    mode: str = "and"  # and / or


class FeedBase(JobFeed):
    description: str = ""


class FeedIn(JobFeed):
    pass


class FeedDB(JobFeed, MongoModel):
    author: UserOut
    updated: datetime = Field(default_factory=datetime.utcnow)


class FeedOut(FeedDB):
    pass
