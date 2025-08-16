import time

from fastapi.testclient import TestClient

from app.config import settings
from app.tests.utils import (
    create_dataset,
    feed_example,
    register_v2_listener,
    upload_file,
)


def test_feeds(client: TestClient, headers: dict):
    listener_name = "test.test_feeds"
    listener_id = register_v2_listener(client, headers, listener_name).get("id")

    # Create a new search feed for file based on the filename
    response = client.post(
        f"{settings.API_V2_STR}/feeds", json=feed_example, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    feed_id = response.json().get("id")

    # Assign listener to feed
    jbody = {"listener_id": listener_id, "automatic": True}
    print(jbody)
    response = client.post(
        f"{settings.API_V2_STR}/feeds/{feed_id}/listeners",
        json=jbody,
        headers=headers,
    )
    print(response)
    print(response.json())
    assert response.status_code == 200

    # Upload file to trigger the feed
    dataset_id = create_dataset(client, headers).get("id")
    file_id = upload_file(
        client, headers, dataset_id, "xyz.txt", "This should trigger."
    ).get("id")

    time.sleep(1)

    # Check if job was automatically created
    response = client.get(
        f"{settings.API_V2_STR}/jobs?listener_id={listener_name}&file_id={file_id}",
        headers=headers,
    )
    assert response.status_code == 200
    assert len(response.json()) > 0
