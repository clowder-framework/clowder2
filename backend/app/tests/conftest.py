from typing import Generator

import pytest
from app.config import settings
from app.main import app
from app.tests.utils import delete_test_data, user_example
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch


@pytest.fixture(autouse=True)
def mock_rabbitmq():
    """Mock RabbitMQ connections for all tests"""
    with patch("aio_pika.connect_robust") as mock_connect:
        mock_channel = AsyncMock()
        mock_exchange = AsyncMock()
        mock_connection = AsyncMock()

        mock_connect.return_value = mock_connection
        mock_connection.__aenter__.return_value = mock_connection
        mock_connection.channel.return_value = mock_channel
        mock_channel.declare_exchange.return_value = mock_exchange

        yield mock_connect


settings.MONGO_DATABASE = "clowder-tests"
settings.elasticsearch_index = "clowder-tests"


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
