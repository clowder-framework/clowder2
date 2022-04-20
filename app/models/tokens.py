from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId


class TokenBase(MongoModel):
    user_id: PyObjectId
    refresh_token: str


class TokenDB(TokenBase):
    pass
