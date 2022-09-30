from datetime import datetime
from pydantic import BaseModel


class SearchIndexContents(BaseModel):
    name: str
    creator: str  # currently just email
    created: datetime
    download: int
