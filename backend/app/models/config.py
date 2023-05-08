from beanie import Document


class ConfigEntryBase(Document):
    key: str
    value: str


class ConfigEntryDB(ConfigEntryBase):
    pass


class ConfigEntryOut(ConfigEntryBase):
    pass
