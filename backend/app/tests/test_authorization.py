from fastapi.testclient import TestClient

from app.config import settings
from app.tests.utils import create_dataset


def test_create(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")

    # Verify role is retrieved
    response = client.get(
        f"{settings.API_V2_STR}/authorizations/datasets/{dataset_id}/role",
        headers=headers,
    )
    assert response.status_code == 200
