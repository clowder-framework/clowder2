from fastapi.testclient import TestClient
from app.config import settings
from app.tests.utils import create_dataset, upload_file


def test_create(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")
    upload_file(client, headers, dataset_id)


def test_get_one(client: TestClient, headers: dict):
    temp_name = "testing file.txt"
    dataset_id = create_dataset(client, headers).get("id")
    upload_file(client, headers, dataset_id, temp_name)

    # Get file from dataset object
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/files", headers=headers
    )
    assert response.status_code == 200
    result = response.json()[0]
    assert result["name"] == temp_name
    assert result["version_num"] == 1
    assert result["dataset_id"] == dataset_id

    # Get file directly
    file_id = result["id"]
    response = client.get(
        f"{settings.API_V2_STR}/files/{file_id}/summary", headers=headers
    )
    assert response.status_code == 200
    result = response.json()
    assert result["name"] == temp_name
    assert result["version_num"] == 1
    assert result["dataset_id"] == dataset_id
