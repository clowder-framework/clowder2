from typing import Generator

import pytest
from fastapi.testclient import TestClient
from app.config import settings
from app.main import app
from app.tests.utils import user_example, delete_test_data

settings.MONGO_DATABASE = "clowder-tests"


@pytest.fixture(scope="session")
def client() -> Generator:
    delete_test_data()
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def root_path() -> str:
    return settings.API_V2_STR


@pytest.fixture(scope="session")
def token(client: TestClient) -> str:
    response = client.post(f"{settings.API_V2_STR}/users", json=user_example)
    assert (
        response.status_code == 200 or response.status_code == 409
    )  # 409 = user already exists
    response = client.post(f"{settings.API_V2_STR}/login", json=user_example)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    return token


@pytest.fixture(scope="session")
def headers(token: str) -> dict:
    return {"Authorization": "Bearer " + token}
