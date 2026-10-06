from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

from app.core.errors import AppError
from app.main import app


class DummyModel(BaseModel):
    name: str = Field(..., min_length=2)


@app.get("/test-app-error")
def route_app_error():
    raise AppError(
        code="MY_ERROR",
        message="My msg",
        status_code=400,
        fields=[{"field": "name", "code": "ERR", "message": "bad"}],
    )


@app.get("/test-path/{item_id}")
def route_path(item_id: int):
    return {"id": item_id}


@app.post("/test-body")
def route_body(item: DummyModel):
    return item


@app.get("/test-http-error")
def route_http_error():
    raise HTTPException(status_code=404, detail="Not found here")


@app.get("/test-unhandled")
def route_unhandled():
    raise ValueError("Oops")


client = TestClient(app, raise_server_exceptions=False)


def test_app_error_handler():
    res = client.get("/test-app-error")
    assert res.status_code == 400
    assert res.json() == {
        "error": {
            "code": "MY_ERROR",
            "message": "My msg",
            "fields": [{"field": "name", "code": "ERR", "message": "bad"}],
        }
    }


def test_validation_path_param_404():
    res = client.get("/test-path/abc")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "NOT_FOUND"


def test_validation_body_422():
    res = client.post("/test-body", json={"name": "a"})
    assert res.status_code == 422
    err = res.json()["error"]
    assert err["code"] == "VALIDATION_ERROR"
    assert "fields" in err
    assert len(err["fields"]) > 0
    assert err["fields"][0]["field"] == "name"


def test_http_exception():
    res = client.get("/test-http-error")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "NOT_FOUND"


def test_unhandled_exception():
    res = client.get("/test-unhandled")
    assert res.status_code == 500
    assert res.json()["error"]["code"] == "INTERNAL_ERROR"
