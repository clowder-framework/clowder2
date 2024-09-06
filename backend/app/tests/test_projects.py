from fastapi.testclient import TestClient

from app.config import settings
from app.tests.utils import (
    create_dataset,
    create_project,
    create_user,
    user_alt,
)

member_alt = {"user": user_alt, "editor": False}


def test_create_project(client: TestClient, headers: dict):
    create_project(client, headers)


def test_get_project(client: TestClient, headers: dict):
    project_id = create_project(client, headers).get("id")
    response = client.get(
        f"{settings.API_V2_STR}/projects/{project_id}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_delete_project(client: TestClient, headers: dict):
    project_id = create_project(client, headers).get("id")
    response = client.delete(
        f"{settings.API_V2_STR}/projects/{project_id}", headers=headers
    )
    assert response.status_code == 200


def test_add_member(client: TestClient, headers: dict):
    new_project = create_project(client, headers)
    project_id = new_project.get("id")

    create_user(client, headers)
    new_project["users"].append(member_alt)

    response = client.post(
        f"{settings.API_V2_STR}/projects/{project_id}/add_member/{member_alt['user']['email']}",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json().get("id") is not None
    for user in response.json().get("users"):
        assert user.get("user").get("email") == member_alt["user"]["email"]


def test_add_dataset(client: TestClient, headers: dict):
    new_project = create_project(client, headers)
    project_id = new_project.get("id")

    dataset_id = create_dataset(client, headers).get("id")

    response = client.post(
        f"{settings.API_V2_STR}/projects/{project_id}/add_dataset/{dataset_id}",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json().get("id") is not None
    assert dataset_id in response.json().get("dataset_ids")
