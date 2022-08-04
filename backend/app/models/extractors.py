from datetime import datetime
from pydantic import Field
from typing import Optional, List
from app.models.mongomodel import MongoModel


class Repository(MongoModel):
    repository_type: str = 'git'
    repository_url: str = ''

class ExtractionProcessTriggers(MongoModel):
    dataset: List[str] = []
    file: List[str] = []
    metadata: List[str] = []

class ExtractorIdentifier(MongoModel):
    name: str
    version: float = 1.0
    updated: datetime = Field(default_factory=datetime.utcnow)
    author: str
    contributors: List[str] = []
    # contexts: str
    repository: Repository
    external_services: List[str]
    libraries: List[str]
    bibtex: List[str]
    maturity: str = "Development"
    default_labels: List[str] = []
    process: ExtractionProcessTriggers = ExtractionProcessTriggers()
    categories: List[str]
    # parameters: str



class ExtractorBase(ExtractorIdentifier):
    description: str = ""


class ExtractorIn(ExtractorBase):
    pass


class ExtractorDB(ExtractorBase):
    pass



class ExtractorOut(ExtractorDB):
    pass
