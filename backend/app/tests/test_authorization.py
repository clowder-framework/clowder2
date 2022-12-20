from fastapi.testclient import TestClient
from app.config import settings


authorization_data = {"dataset_id": "6373acfad19c970d5dab6473", "user_id": "test@test.org", "role": "owner"}
def test_create(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/authorizations", json=authorization_data, headers=headers
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200


def test_get_role(client: TestClient, headers: dict):
    response = client.get(
        f"{settings.API_V2_STR}/authorizations/datasets/6373acfad19c970d5dab6473/role", headers=headers
    )
    assert response.status_code == 200


def test_dep_role(client: TestClient, headers: dict):
    response = client.get(
        f"{settings.API_V2_STR}/authorizations/datasets/6373acfad19c970d5dab6473/role/owner", headers=headers
    )
    assert response.status_code == 200

    response = client.get(
        f"{settings.API_V2_STR}/authorizations/datasets/6373acfad19c970d5dab6473/role/viewer", headers=headers
    )
    assert response.status_code == 403 # not authorized
