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
    response = client.patch(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/thumbnail/{thumbnail_id}",
        headers=headers,
    )
    assert response.status_code == 200

    # Add visualization
    test_visualization_config = {
        "client": "testClient",
        "parameters": {"url": "testurl.com"},
        "visualization_mimetype": "testMimeType",
        "visualization_component_id": "basic-image-component",
    }
    visualization_example = "vis_upload.csv"
    visualization_content_example = "year,location,count\n2024,preview,4"
    resource = {"resource_id": dataset_id, "collection": "datasets"}
    vis_name = "test vis data"
    vis_description = "test visualization data"
    test_visualization_config["resource"] = resource
    response = client.post(
        f"{settings.API_V2_STR}/visualizations/config",
        json=test_visualization_config,
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    # add vis data
    visualization_config_id = response.json().get("id")
    with open(visualization_example, "w") as tempf:
        tempf.write(visualization_content_example)
    vis_file = {"file": open(visualization_example, "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/visualizations/?name={vis_name}&description={vis_description}&config={visualization_config_id}",
        headers=headers,
        files=vis_file,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

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
    # document version 1 dataset
    dataset_version_1 = response.json()
    dataset_version_1_id = dataset_version_1.get("id")

    # get specific versions
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/freeze/2", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("frozen_version_num") == 2
    assert (
        response.json().get("origin_id") == dataset_id
    )  # datasetId should stay the same
    # document version 2 dataset
    dataset_version_2 = response.json()
    dataset_version_2_id = dataset_version_2.get("id")

    # document version 1 & 2 vis id
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{dataset_version_1_id}/config",
        headers=headers,
    )
    version_1_vis_config_id = response.json()[0].get("id")
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/config/{version_1_vis_config_id}/visdata",
        headers=headers,
    )
    version_1_vis_id = response.json()[0].get("id")

    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{dataset_version_2_id}/config",
        headers=headers,
    )
    version_2_vis_config_id = response.json()[0].get("id")
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/config/{version_2_vis_config_id}/visdata",
        headers=headers,
    )
    version_2_vis_id = response.json()[0].get("id")

    # get all versions
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/freeze", headers=headers
    )
    assert response.status_code == 200
    assert len(response.json().get("data")) == 2
    assert response.json().get("metadata") == {"total_count": 2, "skip": 0, "limit": 10}

    ######################## delete ########################
    # delete a specific version (version 1)
    response = client.delete(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/freeze/1", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("deleted") is True
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

    # check if visualization is gone
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{dataset_version_1_id}/config",
        headers=headers,
    )
    assert response.json() == []
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{dataset_id}/config",
        headers=headers,
    )
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

    # check if visualization bytes is gone
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{version_1_vis_config_id}/config/visdata",
        headers=headers,
    )
    assert response.status_code == 404
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{version_1_vis_id}/",
        headers=headers,
    )
    assert response.status_code == 404

    ############################################
    # delete the whole dataset
    response = client.delete(
        f"{settings.API_V2_STR}/datasets/{dataset_id}", headers=headers
    )
    assert response.status_code == 200

    # check metadata, thumbnail and visualization is gone
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_version_2_id}/metadata",
        headers=headers,
    )
    assert response.status_code == 404
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/metadata",
        headers=headers,
    )
    assert response.status_code == 404
    dataset_version_2_thumbnail_id = dataset_version_2.get("thumbnail_id")
    response = client.get(
        f"{settings.API_V2_STR}/thumbnail/{dataset_version_2_thumbnail_id}",
        headers=headers,
    )
    assert response.status_code == 404
    response = client.get(
        f"{settings.API_V2_STR}/thumbnails/{thumbnail_id}", headers=headers
    )
    assert response.status_code == 404
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{dataset_version_2_id}/config",
        headers=headers,
    )
    assert response.json() == []
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{dataset_id}/config",
        headers=headers,
    )
    assert response.json() == []
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{version_2_vis_config_id}/config/visdata",
        headers=headers,
    )
    assert response.status_code == 404
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{version_2_vis_id}/",
        headers=headers,
    )
    assert response.status_code == 404
