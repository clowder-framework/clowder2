import os

from app.config import settings
from app.tests.utils import create_dataset, generate_png, upload_file
from fastapi.testclient import TestClient


def test_freeze_and_delete(client: TestClient, headers: dict):
    # Create dataset
    dataset_id = create_dataset(client, headers).get("id")

    # Upload files
    upload_file(client, headers, dataset_id).get("id")

    # Add thumbnails
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

    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/freeze", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("frozen") is True
    assert response.json().get("frozen_version_num") == 1
    assert (
        response.json().get("origin_id") == dataset_id
    )  # datasetId should stay the same

    # Freeze again check version
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/freeze", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("frozen") is True
    assert response.json().get("frozen_version_num") == 2
    assert (
        response.json().get("origin_id") == dataset_id
    )  # datasetId should stay the same

    # get latest versions
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/freeze/latest_version_num",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json() == 2

    # get specific versions
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/freeze/1", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("frozen_version_num") == 1
    assert (
        response.json().get("origin_id") == dataset_id
    )  # datasetId should stay the same
    # document version 1 dataset id
    dataset_version_1 = response.json()

    # get all versions
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/freeze", headers=headers
    )
    assert response.status_code == 200
    assert len(response.json().get("data")) == 2
    assert response.json().get("metadata") == {"total_count": 2, "skip": 0, "limit": 10}

    # delete a specific version (version 1)
    response = client.delete(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/freeze/1", headers=headers
    )
    dataset_version_1_id = dataset_version_1.get("id")
    assert response.status_code == 200
    assert response.json().get("deleted") == True
    assert response.json().get("id") == dataset_version_1_id

    # check the original dataset still exist
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}", headers=headers
    )
    assert response.status_code == 200

    # check only if the files and folders belong to that dataset doesn't exist anymore
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_version_1_id}/folders_and_files",
        headers=headers,
    )
    assert response.status_code == 403
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/folders_and_files",
        headers=headers,
    )
    assert response.status_code == 200

    # check only if the metadata is gone
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_version_1_id}/metadata",
        headers=headers,
    )
    assert response.status_code == 403
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata", headers=headers
    )
    assert response.status_code == 200

    # check if thumbnail is gone
    dataset_version_1_thumbnail_id = dataset_version_1.get("thumbnail_id")
    response = client.get(
        f"{settings.API_V2_STR}/thumbnail/{dataset_version_1_thumbnail_id}",
        headers=headers,
    )
    assert response.status_code == 404
    response = client.get(
        f"{settings.API_V2_STR}/thumbnails/{thumbnail_id}", headers=headers
    )
    assert response.status_code == 200

    # delete the whole dataset
    response = client.delete(
        f"{settings.API_V2_STR}/datasets/{dataset_id}", headers=headers
    )
    assert response.status_code == 200
