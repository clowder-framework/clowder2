from fastapi.testclient import TestClient

from app.config import settings
from app.tests.utils import create_apikey


def test_create_apikey(client: TestClient, headers: dict):
    key_id = create_apikey(client, headers).get("id")
    response = client.get(f"{settings.API_V2_STR}/users/keys/{key_id}", headers=headers)
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_list_apikeys(client: TestClient, headers: dict):
    pass


def test_delete_apikeys(client: TestClient, headers: dict):
    pass
