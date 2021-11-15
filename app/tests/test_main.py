from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_docs():
    response = client.get("/docs")
    assert response.status_code == 200
