from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, raise_server_exceptions=False)


@app.post("/test-body-middleware")
def dummy_endpoint(payload: dict):
    return {"ok": True}


def test_payload_too_large():
    large_payload = "a" * (1024 * 1024 + 1)
    res = client.post(
        "/test-body-middleware", content=large_payload, headers={"Content-Type": "application/json"}
    )
    assert res.status_code == 413
    assert res.json()["error"]["code"] == "PAYLOAD_TOO_LARGE"


def test_payload_ok():
    res = client.post("/test-body-middleware", json={"name": "test"})
    assert res.status_code == 200
