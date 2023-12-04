from app.config import settings
from app.tests.utils import create_dataset, create_folder
from fastapi.testclient import TestClient


def test_create_nested(client: TestClient, headers: dict):
    dataset_id = create_dataset(client, headers).get("id")

    # create top level folder
    folder1_id = create_folder(client, headers, dataset_id, "top folder").get("id")

    # create nested folder
    create_folder(client, headers, dataset_id, "nested folder", folder1_id).get("id")

    # list top level folders
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/folders",
        headers=headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 1

    # list nested folders
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/folders?folder_id={folder1_id}",
        headers=headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
