from datetime import datetime
from pydantic import Field
from typing import Optional, List, Union
from app.models.mongomodel import MongoModel
from app.models.listeners import ListenerOut



class SearchCriteria(MongoModel):
    field: str
    operator: str
    value: str


class ListenerFeed(MongoModel):
    name: str
    updated: datetime = Field(default_factory=datetime.utcnow)
    author: str
    criteria: List[str] = []
    listeners: List[ListenerOut]


class FeedBase(ListenerFeed):
    description: str = ""


class FeedIn(ListenerFeed):
    pass


class FeedDB(ListenerFeed):
    pass


class FeedOut(ListenerFeed):
    pass
