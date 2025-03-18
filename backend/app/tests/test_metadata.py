import time

import pytest as pytest
from app.config import settings
from app.search.connect import connect_elasticsearch, search_index
from app.tests.utils import create_dataset, upload_file
from fastapi.testclient import TestClient

metadata_definition = {
    "name": "LatLon",
    "description": "A set of Latitude/Longitude coordinates",
    "required_for_items": {
        "datasets": True,
        "files": True,
    },
    "@context": [
        {
            "longitude": "https://schema.org/longitude",
            "latitude": "https://schema.org/latitude",
        }
    ],
    "fields": [
        {
            "name": "longitude",
            "list": False,
            "widgetType": "TextField",
            "config": {"type": "float"},
            "required": True,
        },
        {
            "name": "latitude",
            "list": False,
            "widgetType": "TextField",
            "config": {"type": "float"},
            "required": True,
        },
    ],
}

metadata_definition2 = {
    "name": "AlternativeTitle",
    "description": "Alternative title",
    "required_for_items": {
        "datasets": True,
        "files": False,
    },
    "@context": [{"title": "https://schema.org/alternateName"}],
    "fields": [
        {
            "name": "alternateName",
            "list": False,
            "widgetType": "TextField",
            "config": {"type": "str"},
            "required": True,
        }
    ],
}

metadata_using_definition = {
    "content": {"latitude": "24.4", "longitude": 32.04},
    "definition": "LatLon",
}

metadata_using_context_url = {
    "content": {"alternateName": "different name"},
    "context_url": "http://clowderframework.org",
}


# Dataset tests
def test_dataset_create_metadata_no_context(client: TestClient, headers: dict):
    # Create dataset and try to add metadata that doesn't have any context
    dataset_id = create_dataset(client, headers).get("id")
    bad_md = dict(metadata_using_context_url)
    del bad_md["context_url"]
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=bad_md,
    )
    assert response.status_code == 400


def test_dataset_create_and_delete_metadata_definition_success(
    client: TestClient, headers: dict
):
    # Post the definition itself
    response = client.post(
        f"{settings.API_V2_STR}/metadata/definition",
        json=metadata_definition2,
        headers=headers,
    )
    assert (
        response.status_code == 200 or response.status_code == 409
    )  # 409 = definition already exists
    metadata_definition_id = response.json().get("id")

    # Delete metadata definition
    response = client.delete(
        f"{settings.API_V2_STR}/metadata/definition/{metadata_definition_id}",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json().get("id") == metadata_definition_id


def test_dataset_create_and_delete_metadata_definition_fail(
    client: TestClient, headers: dict
):
    # Post the definition itself
    response = client.post(
        f"{settings.API_V2_STR}/metadata/definition",
        json=metadata_definition,
        headers=headers,
    )
    assert (
        response.status_code == 200 or response.status_code == 409
    )  # 409 = definition already exists
    metadata_definition_id = response.json().get("id")

    # check if @context is injected correctly
    assert response.json().get("@context") is not None

    # Create dataset and add metadata to it using new definition
    dataset_id = create_dataset(client, headers).get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=metadata_using_definition,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    # Add metadata that doesn't match definition
    bad_md = dict(metadata_using_definition)
    bad_md["content"] = {"x": "24.4", "y": 32.04}
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=bad_md,
    )
    assert response.status_code == 409

    # Delete metadata definition
    response = client.delete(
        f"{settings.API_V2_STR}/metadata/definition/{metadata_definition_id}",
        headers=headers,
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_dataset_patch_metadata_definition(client: TestClient, headers: dict):
    # Post the definition itself
    response = client.post(
        f"{settings.API_V2_STR}/metadata/definition",
        json=metadata_definition,
        headers=headers,
    )
    assert (
        response.status_code == 200 or response.status_code == 409
    )  # 409 = definition already exists

    # Create dataset and add metadata to it using new definition
    dataset_id = create_dataset(client, headers).get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=metadata_using_definition,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    time.sleep(5)
    # check for metadata def in elasticsearch
    es = await connect_elasticsearch()
    metadata_query = []
    # header
    metadata_query.append({"index": settings.elasticsearch_index})
    # body
    metadata_query.append({"query": {"match": {"metadata.latitude": "24.4"}}})
    result = search_index(es, settings.elasticsearch_index, metadata_query)
    assert (
        result.body["responses"][0]["hits"]["hits"][0]["_source"]["metadata"][0][
            "latitude"
        ]
        == "24.4"
    )


@pytest.mark.asyncio
async def test_dataset_create_metadata_context_url(client: TestClient, headers: dict):
    # Create dataset and add metadata to it using context_url
    dataset_id = create_dataset(client, headers).get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=metadata_using_context_url,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    time.sleep(5)
    # check for metadata def in elasticsearch
    es = await connect_elasticsearch()
    metadata_query = []
    # header
    metadata_query.append({"index": settings.elasticsearch_index})
    # body
    metadata_query.append(
        {"query": {"match": {"metadata.alternateName": "different name"}}}
    )
    result = search_index(es, settings.elasticsearch_index, metadata_query)
    assert (
        result.body["responses"][0]["hits"]["hits"][0]["_source"]["metadata"][0][
            "alternateName"
        ]
        == "different name"
    )


def test_dataset_delete_metadata(client: TestClient, headers: dict):
    # Create dataset and add metadata to it using context_url, then delete dataset
    dataset_id = create_dataset(client, headers).get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=metadata_using_context_url,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    metadata_id = response.json().get("id")
    response = client.delete(
        f"{settings.API_V2_STR}/metadata/{metadata_id}",
        headers=headers,
    )
    assert response.status_code == 200


# File tests
def test_file_create_metadata_no_context(client: TestClient, headers: dict):
    # Create dataset, upload file and try to add metadata that doesn't have any context
    dataset_id = create_dataset(client, headers).get("id")
    file_id = upload_file(client, headers, dataset_id).get("id")
    bad_md = dict(metadata_using_context_url)
    del bad_md["context_url"]
    response = client.post(
        f"{settings.API_V2_STR}/files/{file_id}/metadata",
        headers=headers,
        json=bad_md,
    )
    assert response.status_code == 400


def test_file_create_metadata_definition(client: TestClient, headers: dict):
    # Post the definition itself
    response = client.post(
        f"{settings.API_V2_STR}/metadata/definition",
        json=metadata_definition,
        headers=headers,
    )
    assert (
        response.status_code == 200 or response.status_code == 409
    )  # 409 = definition already exists

    # Create dataset and add metadata to it using new definition
    dataset_id = create_dataset(client, headers).get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=metadata_using_definition,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    # Add metadata that doesn't match definition
    bad_md = dict(metadata_using_definition)
    bad_md["content"] = {"x": "24.4", "y": 32.04}
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=bad_md,
    )
    assert response.status_code == 409
