import os

from app.config import settings
from app.tests.utils import create_apikey, create_dataset, upload_file
from fastapi.testclient import TestClient

visualization_example = "vis_upload.csv"
visualization_content_example = "year,location,count\n2024,preview,4"
vis_name = "test vis data"
vis_description = "test visualization data"

test_visualization_config = {
    "client": "testClient",
    "parameters": {"url": "testurl.com"},
    "visualization_mimetype": "testMimeType",
    "visualization_component_id": "basic-image-component",
}


def test_visualization(client: TestClient, headers: dict):
    # create a dataset and a file
    create_apikey(client, headers)
    temp_name = "testing file.txt"
    dataset_id = create_dataset(client, headers).get("id")
    upload_file(client, headers, dataset_id, temp_name)

    # Get file from dataset object
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/files", headers=headers
    )
    assert response.status_code == 200
    result = response.json().get("data")[0]
    file_id = result["id"]

    # create a visualization_config for the file
    resource = {"resource_id": file_id, "collection": "files"}
    test_visualization_config["resource"] = resource
    response = client.post(
        f"{settings.API_V2_STR}/visualizations/config",
        json=test_visualization_config,
        headers=headers,
    )
    print(response)
    assert response.json().get("id") is not None
    visualization_config_id = response.json().get("id")
    with open(visualization_example, "w") as tempf:
        tempf.write(visualization_content_example)
    vis_file = {"file": open(visualization_example, "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/visualizations/?name={vis_name}&description={vis_description}&config={visualization_config_id}",
        headers=headers,
        files=vis_file,
    )

    vis_id = response.json().get("id")
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{vis_id}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{vis_id}/bytes",
        headers=headers,
    )
    assert response.status_code == 200

    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{vis_id}/url",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json().get("presigned_url") is not None

    # test that you can get the vis data from the viz config id
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/config/{visualization_config_id}",
        headers=headers,
    )
    assert response.status_code == 200

    response = client.delete(
        f"{settings.API_V2_STR}/visualizations/{vis_id}", headers=headers
    )
    assert response.status_code == 200

    os.remove(visualization_example)
