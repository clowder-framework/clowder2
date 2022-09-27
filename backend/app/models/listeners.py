from datetime import datetime
from pydantic import Field
from typing import Optional, List, Union
from app.models.mongomodel import MongoModel


class Repository(MongoModel):
    repository_type: str = "git"
    repository_url: str = ""


class Listener(MongoModel):
    name: str
    version: str = "1.0"
    updated: datetime = Field(default_factory=datetime.utcnow)
    author: str
    contributors: List[str] = []
    contexts: List[dict] = []
    repository: Union[list[Repository], None] = None
    external_services: List[str]
    libraries: List[str] = []
    bibtex: List[str]
    maturity: str = "Development"
    default_labels: List[str] = []
    process: dict
    categories: List[str] = []
    parameters: List[dict] = []


class ListenerBase(Listener):
    description: str = ""


class ListenerIn(Listener):
    pass


class ListenerDB(Listener):
    pass


class ListenerOut(Listener):
    pass
