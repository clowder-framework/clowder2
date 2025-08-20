from app.config import settings
from fastapi.testclient import TestClient

license_example = {
    "name": "test license",
    "description": "test description",
    "url": "test url",
    "holders": " test holders",
}


def test_license(client: TestClient, headers: dict):
    # create
    response = client.post(
        f"{settings.API_V2_STR}/licenses/?user=test@test.org",
        headers=headers,
        json=license_example,
    )
    assert response.status_code == 200
    license_id = response.json().get("id")

    # private get without token should fail
    response = client.get(f"{settings.API_V2_STR}/licenses/{license_id}")
    assert response.status_code == 401

    # private get with token should pass
    response = client.get(
        f"{settings.API_V2_STR}/licenses/{license_id}", headers=headers
    )
    assert response.status_code == 200

    # public get route without token should pass
    response = client.get(
        f"{settings.API_V2_STR}/public_licenses/{license_id}"  # , headers=headers
    )
    assert response.status_code == 200

    # edit
    license_info = response.json()
    license_info["version"] = "1.1"
    license_info["description"] = "abc"
    response = client.put(
        f"{settings.API_V2_STR}/licenses/{license_id}",
        headers=headers,
        json=license_info,
    )
    assert response.status_code == 200
    assert response.json()["version"] == "1.1"
    assert response.json()["description"] == "abc"

    # delete
    response = client.delete(
        f"{settings.API_V2_STR}/licenses/{license_id}", headers=headers
    )
    assert response.status_code == 200
