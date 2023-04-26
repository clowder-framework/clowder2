from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


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


class ElasticsearchEntry(BaseModel):
    """These Entries are used to generate the JSON for files/datasets/etc. that go into Elasticsearch index.
    user_ids is a list of email addresses that have permission to view the document."""

    creator: str
    created: datetime
    modified: Optional[datetime] = None
    user_ids: List[str] = []


class ESFileEntry(ElasticsearchEntry):
    name: str
    content_type: str
    content_type_main: str
    dataset_id: str
    folder_id: str
    bytes: int
    downloads: int


class ESDatasetEntry(ElasticsearchEntry):
    name: str
    description: str
    downloads: int


class ESMetadataEntry(ElasticsearchEntry):
    resource_id: str
    resource_type: str = "file"
    resource_created: datetime
    resource_creator: str
    content: dict
    context_url: Optional[str] = None
    context: Optional[List[dict]] = []
    definition: Optional[str] = None
