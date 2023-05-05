from app.models.mongomodel import MongoModel, BaseModel
from beanie import Document, View, PydanticObjectId


class TokenBase(BaseModel):
    email: str
    refresh_token: str


class TokenDB(Document, TokenBase):
    pass
