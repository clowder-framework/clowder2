import pymongo
from beanie import Document


class ConfigEntryBase(Document):
    key: str
    value: str

    class Settings:
        name = "config"
        indexes = [
            [
                ("key", pymongo.TEXT),
            ],
        ]


class ConfigEntryDB(ConfigEntryBase):
    pass


class ConfigEntryOut(ConfigEntryBase):
    pass
