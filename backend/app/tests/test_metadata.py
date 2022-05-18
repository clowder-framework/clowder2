from fastapi.testclient import TestClient
from app.config import settings

dataset_data = {
    "name": "first dataset",
    "description": "a dataset is a container of files and metadata",
}

metadata_definition = {
    "name": "LatLon",
    "description": "A set of Latitude/Longitude coordinates",
    "context": {
        "longitude": "https://schema.org/longitude",
        "latitude": "https://schema.org/latitude"
    },
    "fields": [{
        "name": "longitude",
        "type": "float",
        "required": "True"
    },{
        "name": "latitude",
        "type": "float",
        "required": "True"
    }]
}

metadata_using_definition = {
    "contents": {
        "latitude": "24.4",
        "longitude": 32.04
    },
    "definition": "LatLon"
}

metadata_using_context_url = {
    "contents": {
        "color":
            "blue"
    },
    "context_url": "clowder.org"
}


def test_create_definition(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/metadata/definition", json=metadata_definition, headers=headers
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200
    response = client.post(
        f"{settings.API_V2_STR}/datasets", headers=headers, json=dataset_data
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    dataset_id = response.json().get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata", headers=headers, json=metadata_using_definition
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_create_context_url(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/datasets", headers=headers, json=metadata_using_context_url
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    dataset_id = response.json().get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

