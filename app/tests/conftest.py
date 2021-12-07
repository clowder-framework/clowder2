import motor.motor_asyncio
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from app.config import settings
from app.dependencies import get_db
from app.main import app


async def override_get_db() -> Generator:
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    db = mongo_client["clowder-tests"]
    yield db


@pytest.fixture(scope="module")
def client() -> Generator:
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def root_path() -> str:
    return settings.API_V2_STR
