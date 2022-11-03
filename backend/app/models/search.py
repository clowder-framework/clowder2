from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List


# TODO: may eventually be split by index (resource type)
class SearchIndexContents(BaseModel):
    """This describes what is indexed in Elasticsearch for a given resource."""

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
    """This is a way to save a search (i.e. as a Feed).

    Parameters:
        index_name -- which ES index to search
        criteria -- some number of field/operator/value tuples describing the search requirements
        mode -- and/or determines whether all of the criteria must match, or any of them
        original -- if the user originally performed a string search, their original text entry is preserved here
    """

    index_name: str
    criteria: List[SearchCriteria] = []
    mode: str = "and"  # and / or
    original: Optional[str]  # original un-parsed search string
