from datetime import datetime
from pydantic import Field
from typing import Optional, List, Union
from app.models.mongomodel import MongoModel
from app.models.users import UserOut
from app.models.listeners import ListenerOut



class SearchCriteria(MongoModel):
    field: str
    operator: str
    value: str


class JobFeed(MongoModel):
    name: str
    criteria: List[SearchCriteria] = []
    listeners: List[ListenerOut] = []


class FeedBase(JobFeed):
    description: str = ""


class FeedIn(JobFeed):
    pass


class FeedDB(JobFeed):
    author: UserOut
    updated: datetime = Field(default_factory=datetime.utcnow)


class FeedOut(JobFeed):
    pass
