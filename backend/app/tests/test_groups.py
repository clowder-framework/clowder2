from fastapi.testclient import TestClient
from app.config import settings
from app.tests.utils import create_dataset, create_group, user_alt

member_alt = {"user": user_alt, "editor": False}


def test_create_group(client: TestClient, headers: dict):
    create_group(client, headers)


def test_get_group(client: TestClient, headers: dict):
    group_id = create_group(client, headers).get("id")
    response = client.get(f"{settings.API_V2_STR}/groups/{group_id}", headers=headers)
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_edit_group(client: TestClient, headers: dict):
    new_group = create_group(client, headers)
    new_group["name"] = "edited first group"
    response = client.post(
        f"{settings.API_V2_STR}/groups", headers=headers, json=new_group
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_add_and_remove_member(client: TestClient, headers: dict):
    new_group = create_group(client, headers)
    # adding new member
    new_group["users"].append(member_alt)
    response = client.post(
        f"{settings.API_V2_STR}/groups", headers=headers, json=new_group
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    # removing member
    new_group = response.json()
    new_group["users"].pop()

    # TODO add a put endpoint for this
    response = client.post(
        f"{settings.API_V2_STR}/groups", headers=headers, json=new_group
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_delete_group(client: TestClient, headers: dict):
    group_id = create_group(client, headers).get("id")
    response = client.delete(
        f"{settings.API_V2_STR}/groups/{group_id}", headers=headers
    )
    assert response.status_code == 200


def test_search_group(client: TestClient, headers: dict):
    create_group(client, headers)
    search_term = "group"
    response = client.get(
        f"{settings.API_V2_STR}/groups/search/{search_term}", headers=headers
    )
    assert response.status_code == 200


# TODO: Make group, add 2 users, grant them permission on dataset, add & remove user from group
def test_member_permissions(client: TestClient, headers: dict):
    new_group = create_group(client, headers)
    # adding new member
    new_group["users"].append(member_alt)
    response = client.post(
        f"{settings.API_V2_STR}/groups", headers=headers, json=new_group
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    # Create a dataset
    dataset_id = create_dataset(client, headers).get("id")

    # Add group authorization to dataset

    # Add member & verify role

    # Remove member & verify role

    # removing member
    new_group = response.json()
    new_group["users"].pop()

    # TODO add a put endpoint for this
    response = client.post(
        f"{settings.API_V2_STR}/groups", headers=headers, json=new_group
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
