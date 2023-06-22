import os

from fastapi.testclient import TestClient

from app.config import settings

visualization_example = "viz_upload.csv"
visualization_content_example = "year,location,count\n2024,preview,4"
viz_example = {
    "name": "test visualization data",
    "description": "test visualization data",
}


def test_viz_data(client: TestClient, headers: dict):
    """Adds an entry in visualization in db and returns the JSON."""
    with open(visualization_example, "w") as tempf:
        tempf.write(visualization_content_example)
    viz_data = {"file": open(visualization_example, "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/visualization",
        headers=headers,
        json=viz_example,
        data=viz_data,
    )
    os.remove(visualization_example)
    print("response:", response)
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()

    viz_id = response.json().get("id")
    response = client.get(
        f"{settings.API_V2_STR}/visualization/{viz_id}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
