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

user2 = {
    "email": "test2@test.org",
    "password": "not_a_password",
    "first_name": "test",
    "last_name": "user",
}

member2 = {"user": user2, "is_owner": False}


def test_create_group(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/groups", json=group_data_in, headers=headers
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200


def test_get_group(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/groups", json=group_data_in, headers=headers
    )
    assert response.json().get("id") is not None
    group_id = response.json().get("id")
    response = client.get(f"{settings.API_V2_STR}/groups/{group_id}", headers=headers)
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_edit_group(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/groups", json=group_data_in, headers=headers
    )
    assert response.json().get("id") is not None
    new_group = response.json()
    new_group["name"] = "edited first group"
    response = client.post(
        f"{settings.API_V2_STR}/groups", headers=headers, json=new_group
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_add_and_remove_member(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/groups", json=group_data_in, headers=headers
    )
    assert response.json().get("id") is not None

    # adding new member
    new_group = response.json()
    new_group["userList"].append(member2)
    response = client.post(
        f"{settings.API_V2_STR}/groups", headers=headers, json=new_group
    )
    assert response.status_code == 200
    print(response.json())
    assert response.json().get("id") is not None

    # removing member
    new_group = response.json()
    new_group["userList"].remove(member2)
    response = client.post(
        f"{settings.API_V2_STR}/groups", headers=headers, json=new_group
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_delete_group(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/groups", json=group_data_in, headers=headers
    )
    assert response.json().get("id") is not None
    group_id = response.json().get("id")
    response = client.delete(
        f"{settings.API_V2_STR}/groups/{group_id}", headers=headers
    )
    assert response.status_code == 200


def test_search_group(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/groups", json=group_data_in, headers=headers
    )
    assert response.json().get("id") is not None

    search_term = "group"
    response = client.get(
        f"{settings.API_V2_STR}/groups/search/{search_term}", headers=headers
    )
    assert response.status_code == 200
