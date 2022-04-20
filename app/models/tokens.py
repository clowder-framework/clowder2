from app.models.mongomodel import MongoModel


class TokenBase(MongoModel):
    user_id: str
    refresh_token: str


class TokenDB(TokenBase):
    pass
