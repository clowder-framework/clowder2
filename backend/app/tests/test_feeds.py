import os
from fastapi.testclient import TestClient
from app.config import settings

dataset_data = {
    "name": "test dataset",
    "description": "a dataset is a container of files and metadata",
}
listener_data = {
    "name": "Test Listener",
    "version": 2,
    "description": "Created for testing purposes."

}
feed_data = {
    "name": "XYZ Test Feed",
    "criteria": [
        {"field": "name", "operator": "==", "value": "xyz"}
    ]
}

def test_feeds(client: TestClient, headers: dict):
    # Create a listener (extractor)
    response = client.post(
        f"{settings.API_V2_STR}/listeners", json=listener_data, headers=headers
    )
    assert response.json().get("id") is not None
    listener_id = response.json().get("id")
    assert response.status_code == 200

    # Create a new search feed for file foo
    test_feed_data = feed_data
    test_feed_data["listeners"] = [{"listener_id": listener_id, "automatic": True}]
    response = client.post(
        f"{settings.API_V2_STR}/feeds", json=test_feed_data, headers=headers
    )
    assert response.json().get("id") is not None
    feed_id = response.json().get("id")
    assert response.status_code == 200

    # Create dataset to hold file
    response = client.post(
        f"{settings.API_V2_STR}/datasets", json=dataset_data, headers=headers
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200
    dataset_id = response.json().get("id")

    # Upload file foo
    dummy_file = "xyz.txt"
    with open(dummy_file, "w") as dummy:
        dummy.write("This should trigger.")
    file_data = {"file": open(dummy_file, "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/files",
        headers=headers,
        files=file_data,
    )
    os.remove(dummy_file)
    assert response.status_code == 200

    # Verify the message

