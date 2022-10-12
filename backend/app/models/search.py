from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List


# This describes what is indexed for a given resource - may eventually be split by index (resource type)
class SearchIndexContents(BaseModel):
    id: str
    name: str
    creator: str  # currently just email
    created: datetime
    download: int


class SearchCriteria(BaseModel):
    field: str
    operator: str = "=="
    value: str


class SearchObject(BaseModel):
    index_name: str
    criteria: List[SearchCriteria] = []
    mode: str = "and"  # and / or
    original: Optional[str]  # original un-parsed search string
