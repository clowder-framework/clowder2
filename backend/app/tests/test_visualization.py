import os

from fastapi.testclient import TestClient

from app.config import settings

visualization_example = "viz_upload.csv"
visualization_content_example = "year,location,count\n2024,preview,4"
viz_name = "test viz data"
viz_description = "test visualization data"


def test_viz_data(client: TestClient, headers: dict):
    with open(visualization_example, "w") as tempf:
        tempf.write(visualization_content_example)
    viz_file = {"file": open(visualization_example, "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/visualizations/?name={viz_name}&description={viz_description}",
        headers=headers,
        files=viz_file,
    )
    os.remove(visualization_example)
    assert response.status_code == 200
    assert response.json().get("id") is not None

    viz_id = response.json().get("id")
    response = client.get(
        f"{settings.API_V2_STR}/visualizations/{viz_id}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None

    response = client.get(
        f"{settings.API_V2_STR}/visualizations/download/{viz_id}",
        headers=headers,
    )
    assert response.status_code == 200

    response = client.delete(
        f"{settings.API_V2_STR}/visualizations/{viz_id}", headers=headers
    )
    assert response.status_code == 200
