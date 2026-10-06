def test_form_crud(client, default_creator):
    # Create
    res = client.post("/api/forms", json={"title": "Test Form"})
    assert res.status_code == 201
    form_id = res.json()["id"]

    # Get
    res = client.get(f"/api/forms/{form_id}")
    if res.status_code != 200:
        print("GET ERROR:", res.status_code, res.content, "FORM_ID:", form_id)
    assert res.status_code == 200
    assert res.json()["title"] == "Test Form"

    # Update
    res = client.patch(f"/api/forms/{form_id}", json={"title": "Updated Form"})
    assert res.status_code == 200
    assert res.json()["title"] == "Updated Form"

    # Delete
    res = client.delete(f"/api/forms/{form_id}")
    assert res.status_code == 204

    # Get -> 404
    res = client.get(f"/api/forms/{form_id}")
    assert res.status_code == 404

    # Non-numeric id -> 404
    res = client.get("/api/forms/abc")
    assert res.status_code == 404


def test_form_list_filters(client, db_session, default_creator):
    # Add multiple forms
    for i in range(3):
        client.post("/api/forms", json={"title": f"My Form {i}"})

    # Escape percent test
    client.post("/api/forms", json={"title": "100% Sale Form"})

    res = client.get("/api/forms")
    assert res.status_code == 200
    assert res.json()["total"] == 4

    res = client.get("/api/forms?q=100%25")
    assert res.status_code == 200
    assert res.json()["total"] == 1
    assert res.json()["items"][0]["title"] == "100% Sale Form"


def test_form_scoping(client, second_creator, db_session):
    res = client.post("/api/forms", json={"title": "Creator 1 Form"})
    form_id = res.json()["id"]

    # Authenticate as second creator by changing security.py dependency override
    from fastapi.testclient import TestClient

    from app.core.security import get_current_creator
    from app.main import app

    def override_get_creator():
        return second_creator

    app.dependency_overrides[get_current_creator] = override_get_creator
    with TestClient(app) as second_client:
        res = second_client.get(f"/api/forms/{form_id}")
        assert res.status_code == 404  # Can't see creator 1's form

        # Second creator creates their own form
        res = second_client.post("/api/forms", json={"title": "Creator 2 Form"})
        assert res.status_code == 201

    app.dependency_overrides.pop(get_current_creator)
