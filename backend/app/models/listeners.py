from datetime import datetime
from pydantic import Field, BaseModel
from typing import Optional, List, Union
from app.models.mongomodel import MongoModel
from app.models.users import UserOut


class Repository(MongoModel):
    repository_type: str = "git"
    repository_url: str = ""


# Currently for extractor_info JSON from Clowder v1 extractors POSTing to /api/extractors
class ListenerProperties(BaseModel):
    author: str  # Referring to author of listener script (e.g. name or email), not Clowder user
    process: dict
    maturity: str = "Development"
    contributors: List[str] = []
    contexts: List[dict] = []
    repository: List[Repository] = []
    external_services: List[str] = []
    libraries: List[str] = []
    bibtex: List[str] = []
    default_labels: List[str] = []
    categories: List[str] = []
    parameters: List[dict] = []


class ListenerBase(BaseModel):
    name: str
    version: str = "1.0"
    description: str = ""


class ListenerIn(ListenerBase):
    pass


class LegacyListenerIn(ListenerProperties):
    name: str
    version: str = "1.0"
    description: str = ""


class ListenerDB(ListenerBase, MongoModel):
    author: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    properties: Optional[ListenerProperties] = None


class ListenerOut(ListenerBase):
    pass
