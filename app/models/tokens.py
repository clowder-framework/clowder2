from app.models.mongomodel import MongoModel


class TokenBase(MongoModel):
    email: str
    refresh_token: str


class TokenDB(TokenBase):
    pass
