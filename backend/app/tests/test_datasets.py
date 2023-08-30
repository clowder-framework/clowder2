import os

from fastapi.testclient import TestClient

from app.config import settings
from app.tests.utils import create_dataset, generate_png


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
    response = client.patch(
        f"{settings.API_V2_STR}/datasets/{new_dataset.get('id')}",
        json={"name": "edited name"},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    assert response.json().get("name") == "edited name"


def test_list(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")
    response = client.get(f"{settings.API_V2_STR}/datasets", headers=headers)
    assert response.status_code == 200
    # TODO: Verify the new dataset_id is actually in this list
    assert len(response.json()) > 0


def test_add_thumbnail(client: TestClient, headers: dict):
    resp = create_dataset(client, headers)
    dataset_id = resp["id"]

    generate_png("test.png")
    file_data = {"file": open("test.png", "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/thumbnails",
        headers=headers,
        files=file_data,
    )
    thumbnail_id = response.json()["id"]
    os.remove("test.png")

    resp = client.patch(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/thumbnail/{thumbnail_id}",
        headers=headers,
    )
    assert resp.status_code == 200

    result = resp.json()
    assert result["thumbnail_id"] == thumbnail_id
