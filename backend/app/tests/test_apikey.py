from app.config import settings
from app.tests.utils import create_apikey
from fastapi.testclient import TestClient


def test_create(client: TestClient, headers: dict):
    hashed_key = create_apikey(client, headers)
    assert hashed_key is not None


def test_list(client: TestClient, headers: dict):
    response = client.get(f"{settings.API_V2_STR}/users/keys", headers=headers)
    assert response.status_code == 200


def test_delete(client: TestClient, headers: dict):
    create_apikey(client, headers)
    get_response = client.get(f"{settings.API_V2_STR}/users/keys", headers=headers)
    key_id = get_response.json().get("data")[0].get("id")
    delete_response = client.delete(
        f"{settings.API_V2_STR}/users/keys/{key_id}", headers=headers
    )
    # TODO: Verify it was actually deleted
    assert delete_response.status_code == 200
