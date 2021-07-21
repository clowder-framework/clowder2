from pydantic import Field

from app.models.mongomodel import OID, MongoModel


class User(MongoModel):
    id: OID = Field(default_factory=OID, alias="_id")
    name: str = Field()
