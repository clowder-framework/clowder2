import os
from fastapi.testclient import TestClient
from app.config import settings
from app.tests.utils import create_dataset, upload_file, register_v1_extractor


def test_register(client: TestClient, headers: dict):
    register_v1_extractor(client, headers)


def test_get_one(client: TestClient, headers: dict):
    extractor_id = register_v1_extractor(client, headers).get("id")
    response = client.get(
        f"{settings.API_V2_STR}/listeners/{extractor_id}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_delete(client: TestClient, headers: dict):
    extractor_id = register_v1_extractor(client, headers).get("id")
    response = client.delete(
        f"{settings.API_V2_STR}/listeners/{extractor_id}", headers=headers
    )
    assert response.status_code == 200


def test_v1_mime_trigger(client: TestClient, headers: dict):
    # Need a new listener otherwise this will collide with test_register above
    ext_name = "ncsa.testextractor.test2"
    extractor_id = register_v1_extractor(client, headers, ext_name).get("id")

    # Verify feeds were created for the process rules
    response = client.get(
        f"{settings.API_V2_STR}/feeds?name={ext_name}", headers=headers
    )
    assert response.status_code == 200
    assert len(response.json()) > 0

    # Upload a text file and verify a job is created
    dataset_id = create_dataset(client, headers)
    file_id = upload_file(client, headers, dataset_id, "trigger_test.txt", "1,2,3").get(
        "id"
    )

    # Check if job was automatically created
    response = client.get(
        f"{settings.API_V2_STR}/jobs?listener_id={ext_name}&file_id={file_id}",
        headers=headers,
    )
    assert response.status_code == 200
    assert len(response.json()) > 0
