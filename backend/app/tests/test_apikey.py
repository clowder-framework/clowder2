from fastapi.testclient import TestClient

from app.config import settings
from app.tests.utils import create_apikey


def test_create_apikey(client: TestClient, headers: dict):
    hashed_key = create_apikey(client, headers)
    assert hashed_key is not None


def test_list_apikeys(client: TestClient, headers: dict):
    response = client.get(f"{settings.API_V2_STR}/users/keys/{key_id}", headers=headers)


def test_delete_apikeys(client: TestClient, headers: dict):
    pass
