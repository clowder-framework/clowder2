from fastapi.testclient import TestClient
from app.config import settings

user = {
    "email": "test@test.org",
    "password": "not_a_password",
    "first_name": "Foo",
    "last_name": "Bar",
}

member = {"user": user, "is_owner": True}

group_data_in = {
    "name": "first group",
    "description": "a group is a container of several users",
    "userList": [member],
}

authorization_data = {"dataset_id": "6373acfad19c970d5dab6473", "role": "editor"}


def test_create(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/groups", json=group_data_in, headers=headers
    )
    assert response.status_code == 200
    group_id = response.json().get("id")

    authorization_data["group_id"] = group_id
    response = client.post(
        f"{settings.API_V2_STR}/authorizations",
        json=authorization_data,
        headers=headers,
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200


def test_get_role(client: TestClient, headers: dict):
    response = client.get(
        f"{settings.API_V2_STR}/authorizations/datasets/6373acfad19c970d5dab6473/role",
        headers=headers,
    )
    assert response.status_code == 200


def test_dep_role(client: TestClient, headers: dict):
    response = client.get(
        f"{settings.API_V2_STR}/authorizations/datasets/6373acfad19c970d5dab6473/role/owner",
        headers=headers,
    )
    assert response.status_code == 403  # not authorized

    response = client.get(
        f"{settings.API_V2_STR}/authorizations/datasets/6373acfad19c970d5dab6473/role/viewer",
        headers=headers,
    )
    assert response.status_code == 200
