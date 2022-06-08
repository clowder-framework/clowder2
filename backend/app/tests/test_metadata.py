from fastapi.testclient import TestClient
from app.config import settings

dataset_data = {
    "name": "test dataset",
    "description": "a dataset is a container of files and metadata",
}

metadata_definition = {
    "name": "LatLon",
    "description": "A set of Latitude/Longitude coordinates",
    "context": {
        "longitude": "https://schema.org/longitude",
        "latitude": "https://schema.org/latitude",
    },
    "fields": [
        {"name": "longitude", "type": "float", "required": "True"},
        {"name": "latitude", "type": "float", "required": "True"},
    ],
}

metadata_using_definition = {
    "contents": {"latitude": "24.4", "longitude": 32.04},
    "definition": "LatLon",
}

metadata_using_context_url = {
    "contents": {"color": "blue"},
    "context_url": "clowder.org",
}


def test_dataset_create_metadata_no_context(client: TestClient, headers: dict):
    # Create dataset and add metadata that doesn't have any context
    response = client.post(
        f"{settings.API_V2_STR}/datasets", headers=headers, json=dataset_data
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    dataset_id = response.json().get("id")
    bad_md = dict(metadata_using_context_url)
    del bad_md["context_url"]
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=bad_md,
    )
    assert response.status_code == 400


def test_dataset_create_metadata_definition(client: TestClient, headers: dict):
    # Post the definition itself
    response = client.post(
        f"{settings.API_V2_STR}/metadata/definition",
        json=metadata_definition,
        headers=headers,
    )
    assert (
        response.status_code == 200 or response.status_code == 409
    )  # 409 = user already exists

    # Create dataset and add metadata to it using new definition
    response = client.post(
        f"{settings.API_V2_STR}/datasets", headers=headers, json=dataset_data
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    dataset_id = response.json().get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=metadata_using_definition,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    # Add metadata that doesn't match definition
    bad_md = dict(metadata_using_definition)
    bad_md["contents"] = {"x": "24.4", "y": 32.04}
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=bad_md,
    )
    assert response.status_code == 409


def test_dataset_patch_metadata_definition(client: TestClient, headers: dict):
    # Post the definition itself
    response = client.post(
        f"{settings.API_V2_STR}/metadata/definition",
        json=metadata_definition,
        headers=headers,
    )
    assert (
        response.status_code == 200 or response.status_code == 409
    )  # 409 = user already exists

    # Create dataset and add metadata to it using new definition
    response = client.post(
        f"{settings.API_V2_STR}/datasets", headers=headers, json=dataset_data
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    dataset_id = response.json().get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=metadata_using_definition,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    # Patch metadata that doesn't match definition


def test_dataset_create_metadata_context_url(client: TestClient, headers: dict):
    # Create dataset and add metadata to it using context_url
    response = client.post(
        f"{settings.API_V2_STR}/datasets", headers=headers, json=dataset_data
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    dataset_id = response.json().get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=metadata_using_context_url,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
