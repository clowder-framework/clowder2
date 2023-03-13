from fastapi.testclient import TestClient
from app.config import settings
from app.tests.utils import create_dataset, create_group, user_alt, create_user, get_user_token
from app.models.pyobjectid import PyObjectId
from app.models.authorization import AuthorizationDB


member_alt = {"user": user_alt, "editor": False}


def test_create_group(client: TestClient, headers: dict):
    create_group(client, headers)


def test_get_group(client: TestClient, headers: dict):
    group_id = create_group(client, headers).get("id")
    response = client.get(f"{settings.API_V2_STR}/groups/{group_id}", headers=headers)
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


def test_member_permissions(client: TestClient, headers: dict):
    new_group = create_group(client, headers)
    group_id = new_group.get("id")

    # adding new group member
    create_user(client, headers)
    new_group["users"].append(member_alt)
    response = client.post(
        f"{settings.API_V2_STR}/groups/{group_id}/add/{member_alt['user']['email']}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    # Create a dataset
    dataset = create_dataset(client, headers)
    dataset_id = dataset.get("id")

    # Add group authorization to dataset
    response = client.post(
        f"{settings.API_V2_STR}/authorizations/datasets/{dataset_id}/group_role/{group_id}/viewer", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    # Verify role
    u_headers = get_user_token(client, headers)
    response = client.get(
        f"{settings.API_V2_STR}/authorizations/datasets/{dataset_id}/role", headers=u_headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    assert response.json().get("role") == "viewer"

    # Remove group member & verify no more role
    response = client.post(
        f"{settings.API_V2_STR}/groups/{group_id}/remove/{member_alt['user']['email']}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    response = client.get(
        f"{settings.API_V2_STR}/authorizations/datasets/{dataset_id}/role", headers=u_headers
    )
    assert response.status_code == 404
