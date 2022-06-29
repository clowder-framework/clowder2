import motor.motor_asyncio
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from app.config import settings
from app.deps import get_db
from app.main import app

user = {
    "email": "test@test.org",
    "password": "not_a_password",
    "first_name": "Foo",
    "last_name": "Bar",
}


async def override_get_db() -> Generator:
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    db = mongo_client["clowder-tests"]
    yield db


@pytest.fixture(scope="session")
def client() -> Generator:
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def root_path() -> str:
    return settings.API_V2_STR


@pytest.fixture(scope="session")
def token(client: TestClient) -> str:
    response = client.post(f"{settings.API_V2_STR}/users", json=user)
    assert (
        response.status_code == 200 or response.status_code == 409
    )  # 409 = user already exists
    response = client.post(f"{settings.API_V2_STR}/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    return token


@pytest.fixture(scope="session")
def headers(token: str) -> dict:
    return {"Authorization": "Bearer " + token}
