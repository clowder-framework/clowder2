import os
from fastapi.testclient import TestClient
from app.config import settings
from app.models.pyobjectid import PyObjectId

extractor_info_file = os.path.join(os.getcwd(), 'extractor_info.json')


def test_register(client: TestClient, headers: dict):
    with open(extractor_info_file, 'r') as f:
        extractor_info = f.read()
    response = client.post(
        f"{settings.API_V2_STR}/extractors", json=extractor_info, headers=headers
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200

def test_get_one(client: TestClient, headers: dict):
    with open(extractor_info_file, 'r') as f:
        extractor_info = f.read()
    response = client.post(
        f"{settings.API_V2_STR}/extractors", json=extractor_info, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    extractor_id = response.json().get("id")
    response = client.get(
        f"{settings.API_V2_STR}/extractors/{extractor_id}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

def test_delete(client: TestClient, headers: dict):
    with open(extractor_info_file, 'r') as f:
        extractor_info = f.read()
    response = client.post(
        f"{settings.API_V2_STR}/extractors", json=extractor_info, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    extractor_id = response.json().get("id")
    response = client.delete(
        f"{settings.API_V2_STR}/extractors/{extractor_id}", headers=headers
    )
    assert response.status_code == 200