from app.models.mongomodel import MongoModel


class ConfigEntryBase(MongoModel):
    key: str
    value: str


class ConfigEntryDB(ConfigEntryBase):
    pass


class ConfigEntryOut(ConfigEntryBase):
    pass
