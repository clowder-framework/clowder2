from app.config import settings
from app.tests.utils import create_dataset
from fastapi.testclient import TestClient


def test_create(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")

    # Verify role is retrieved
    response = client.get(
        f"{settings.API_V2_STR}/authorizations/datasets/{dataset_id}/role",
        headers=headers,
    )
    assert response.status_code == 200


def test_get_admin_info(client: TestClient, headers: dict):
    response = client.get(
        f"{settings.API_V2_STR}/users/me/is_admin",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json() is True

    response = client.get(
        f"{settings.API_V2_STR}/users/me/admin_mode",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json() is False


def test_set_admin_mode(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/users/me/admin_mode?admin_mode_on=True",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json() is True

    response = client.post(
        f"{settings.API_V2_STR}/users/me/admin_mode?admin_mode_on=False",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json() is False
