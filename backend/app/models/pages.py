from pydantic import BaseModel


class PageMetadata(BaseModel):
    total_count: int
    # skip: int
    # limit: int


class Paged(BaseModel):
    metadata: PageMetadata
    data: list
