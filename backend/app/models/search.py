from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class SearchCriteria(BaseModel):
    field: str
    operator: str = "=="
    value: str


class SearchObject(BaseModel):
    """This is a way to save a search (i.e. as a Feed).

    Parameters:
        criteria -- some number of field/operator/value tuples describing the search requirements
        mode -- and/or determines whether all of the criteria must match, or any of them
        original -- if the user originally performed a string search, their original text entry is preserved here
    """

    criteria: List[SearchCriteria] = []
    mode: str = "and"  # and / or
    original: Optional[str]  # original un-parsed search string


class ElasticsearchEntry(BaseModel):
    """These Entries are used to generate the JSON for files/datasets/etc. that go into Elasticsearch index.
    user_ids is a list of email addresses that have permission to view the document."""

    resource_type: str
    creator: str
    created: datetime
    modified: Optional[datetime] = None
    user_ids: List[str] = []
    name: str
    description: Optional[str]
    downloads: int
    # file-specific fields
    content_type: Optional[str]
    content_type_main: Optional[str]
    dataset_id: Optional[str]
    folder_id: Optional[str]
    bytes: Optional[int]
    # metadata fields
    metadata: Optional[List[dict]] = []
    metadata_stringify: Optional[str]
    status: Optional[str]
