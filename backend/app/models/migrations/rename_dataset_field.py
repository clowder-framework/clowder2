from datetime import datetime

import pymongo
from beanie import Document
from beanie import iterative_migration
from pydantic import Field

from app.models.datasets import DatasetBase, DatasetStatus, DatasetDB
from app.models.users import UserOut


class DatasetDBv1(Document, DatasetBase):
    author: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    status: str = DatasetStatus.PRIVATE.name
    views: int = 0
    downloads: int = 0

    class Settings:
        name = "datasets_beanie"
        indexes = [
            [
                ("name", pymongo.TEXT),
                ("description", pymongo.TEXT),
            ],
        ]


class Forward:
    @iterative_migration()
    async def views_to_user_views(
        self, input_document: DatasetDBv1, output_document: DatasetDB
    ):
        output_document.user_views = input_document.views


class Backward:
    @iterative_migration()
    async def user_views_to_views(
        self, input_document: DatasetDB, output_document: DatasetDBv1
    ):
        output_document.views = input_document.user_views
