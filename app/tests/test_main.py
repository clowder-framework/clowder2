from fastapi.testclient import TestClient


def test_main(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_docs(client: TestClient):
    response = client.get("/docs")
    assert response.status_code == 200
