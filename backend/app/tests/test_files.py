import os

from app.config import settings
from app.tests.utils import create_dataset, generate_png, upload_file, upload_files
from fastapi.testclient import TestClient


def test_create_and_delete(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")
    response = upload_file(client, headers, dataset_id)
    file_id = response["id"]
    # DELETE FILE
    response = client.delete(f"{settings.API_V2_STR}/files/{file_id}", headers=headers)
    assert response.status_code == 200

    response_multiple = upload_files(client, headers, dataset_id)
    file_ids = [f["id"] for f in response_multiple]
    # DELETE MULTIPLE FILES
    for file_id in file_ids:
        response = client.delete(
            f"{settings.API_V2_STR}/files/{file_id}", headers=headers
        )
        assert response.status_code == 200


def test_get_one(client: TestClient, headers: dict):
    temp_name = "testing file.txt"
    dataset_id = create_dataset(client, headers).get("id")
    upload_file(client, headers, dataset_id, temp_name)

    # Get file from dataset object
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/files", headers=headers
    )
    assert response.status_code == 200
    result = response.json().get("data")[0]
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


def test_add_thumbnail(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")
    resp = upload_file(client, headers, dataset_id)
    file_id = resp["id"]

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
        f"{settings.API_V2_STR}/files/{file_id}/thumbnail/{thumbnail_id}",
        headers=headers,
    )
    assert resp.status_code == 200

    result = resp.json()
    assert result["thumbnail_id"] == thumbnail_id


def test_download_file_url(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")
    file_resp = upload_file(client, headers, dataset_id)
    response = client.get(
        f"{settings.API_V2_STR}/files/{file_resp['id']}/url",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json().get("presigned_url") is not None

    # clean after test
    response = client.delete(
        f"{settings.API_V2_STR}/datasets/{dataset_id}", headers=headers
    )
    assert response.status_code == 200
