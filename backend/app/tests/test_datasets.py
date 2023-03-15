from fastapi.testclient import TestClient
from app.config import settings
from app.tests.utils import create_dataset


def test_create(client: TestClient, headers: dict):
    create_dataset(client, headers)


def test_get_one(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_delete(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")
    response = client.delete(
        f"{settings.API_V2_STR}/datasets/{dataset_id}", headers=headers
    )
    assert response.status_code == 200


def test_delete_with_metadata(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json={
            "content": {"color": "blue"},
            "context_url": "clowder.org",
        },
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    metadata_id = response.json().get("id")

    # Delete dataset, then ensure metadata is already deleted
    response = client.delete(
        f"{settings.API_V2_STR}/datasets/{dataset_id}", headers=headers
    )
    assert response.status_code == 200
    response = client.delete(
        f"{settings.API_V2_STR}/metadata/{metadata_id}",
        headers=headers,
    )
    assert response.status_code == 404


def test_edit(client: TestClient, headers: dict):
    new_dataset = create_dataset(client, headers)
    new_dataset["name"] = "edited name"
    response = client.post(
        f"{settings.API_V2_STR}/datasets", json=new_dataset, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_list(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")
    response = client.get(f"{settings.API_V2_STR}/datasets", headers=headers)
    assert response.status_code == 200
    # TODO: Verify the new dataset_id is actually in this list
    assert len(response.json()) > 0
