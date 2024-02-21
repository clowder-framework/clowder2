from fastapi.testclient import TestClient

from app.config import settings
from app.tests.utils import (
    create_dataset,
    create_user,
    user_example,
)


def test_license(client: TestClient, headers: dict):
    # create
    dataset_id = create_dataset(client, headers).get("id")
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}", headers=headers
    )
    assert response.status_code == 200
    license_id = response.json().get("license_id")
    assert license_id is not None

    # get
    response = client.get(
        f"{settings.API_V2_STR}/licenses/{license_id}", headers=headers
    )
    assert response.status_code == 200

    # edit
    license_info = response.json()
    license_info["version"] = "1.1"
    license_info["text"] = "abc"
    response = client.put(
        f"{settings.API_V2_STR}/licenses/{license_id}",
        headers=headers,
        json=license_info,
    )
    assert response.status_code == 200
    assert response.json()["version"] == "1.1"
    assert response.json()["text"] == "abc"

    # delete
    response = client.delete(
        f"{settings.API_V2_STR}/licenses/{license_id}", headers=headers
    )
    assert response.status_code == 200
