import os
from fastapi.testclient import TestClient
from app.config import settings
from app.models.pyobjectid import PyObjectId

dataset_data = {
    "name": "test dataset",
    "description": "a dataset is a container of files and metadata",
}

# This file will be created & deleted as part of testing
dummy_file = "test_upload.csv"


def test_create(client: TestClient, headers: dict):
    # Create dataset to hold file
    response = client.post(
        f"{settings.API_V2_STR}/datasets", json=dataset_data, headers=headers
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200

    # Upload test file to dataset
    dataset_id = response.json().get("id")
    with open(dummy_file, "w") as dummy:
        pass
    file_data = {"file": open(dummy_file, "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/files",
        headers=headers,
        files=file_data,
    )
    os.remove(dummy_file)
    assert response.status_code == 200


def test_get_one(client: TestClient, headers: dict):
    # Create dataset to hold file
    response = client.post(
        f"{settings.API_V2_STR}/datasets", json=dataset_data, headers=headers
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200

    # Upload test file to dataset
    dataset_id = response.json().get("id")
    with open(dummy_file, "w") as dummy:
        pass
    file_data = {"file": open(dummy_file, "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/files",
        headers=headers,
        files=file_data,
    )
    os.remove(dummy_file)
    assert response.status_code == 200

    # Get file from dataset object
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/files", headers=headers
    )
    assert response.status_code == 200
    result = response.json()[0]
    assert result["name"] == dummy_file
    assert result["version_num"] == 1
    assert result["dataset_id"] == dataset_id

    # Get file directly
    file_id = result["id"]
    response = client.get(
        f"{settings.API_V2_STR}/files/{file_id}/summary", headers=headers
    )
    assert response.status_code == 200
    result = response.json()
    assert result["name"] == dummy_file
    assert result["version_num"] == 1
    assert result["dataset_id"] == dataset_id
