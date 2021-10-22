import pytest
from typing import Generator
from app.db import MongoClient


@pytest.fixture(scope="session")
def db() -> Generator:
    yield MongoClient()
