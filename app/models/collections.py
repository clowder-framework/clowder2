from mongoengine import DynamicDocument

from app.models.mongomodel import MongoModel


class Collection(MongoModel):
    name: str
    description: str = ""


# class MongoDataset(Document):
#     name = StringField()
#     description = StringField()
#     price = IntField()
#     tax = IntField()


class MongoCollection(DynamicDocument):
    pass
