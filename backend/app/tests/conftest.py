from typing import Generator

import pytest
from fastapi.testclient import TestClient
from pymongo import MongoClient
from app.config import settings
from app.main import app
from app.tests.utils import user_example, delete_test_users

settings.MONGO_DATABASE = "clowder-tests"

mongo_client = MongoClient(settings.MONGODB_URL)
all_dbs = mongo_client.list_database_names()
print(all_dbs)

print('here')
# mongo_client.drop_database("clowder-tests")
# need to delete the keycloak for the test user

@pytest.fixture(scope="session")
def test():
    print("is this testing?")
    print('did it test?')

@pytest.fixture(scope="session")
async def client() -> Generator:
    with TestClient(app) as c:
        await delete_test_users()
        yield c

@pytest.fixture(scope="session")
def cleanup_data(client: TestClient) -> str:
    print('doing this')
    # TODO delete test users
    delete_test_users()
    # TODO delete the entire db
    mongo_client = MongoClient(settings.MONGODB_URL)
    all_dbs = mongo_client.list_database_names()
    delete_response = mongo_client.drop_database("clowder-tests")
    return "response"

@pytest.fixture(scope="session")
def root_path() -> str:
    return settings.API_V2_STR


@pytest.fixture(scope="session")
def token(client: TestClient) -> str:
    response = client.post(f"{settings.API_V2_STR}/users", json=user_example)
    assert (
        response.status_code == 200 or response.status_code == 409
    )  # 409 = user already exists
    response = client.post(f"{settings.API_V2_STR}/login", json=user_example)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    return token


@pytest.fixture(scope="session")
def headers(token: str) -> dict:
    return {"Authorization": "Bearer " + token}
