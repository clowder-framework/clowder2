import os

from fastapi.testclient import TestClient

from app.config import settings

visualization_example = "vis_upload.csv"
visualization_content_example = "year,location,count\n2024,preview,4"
vis_name = "test vis data"
vis_description = "test visualization data"


def test_vis_data(client: TestClient, headers: dict):
    with open(visualization_example, "w") as tempf:
        tempf.write(visualization_content_example)
    vis_file = {"file": open(visualization_example, "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/visualizations/?name={vis_name}&description={vis_description}",
        headers=headers,
        files=vis_file,
    )
    os.remove(visualization_example)
    assert response.status_code == 200
    assert response.json().get("id") is not None

    vis_id = response.json().get("id")
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{vis_id}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{viz_id}/bytes",
        headers=headers,
    )
    assert response.status_code == 200

    response = client.delete(
        f"{settings.API_V2_STR}/visualizations/{vis_id}", headers=headers
    )
    assert response.status_code == 200
