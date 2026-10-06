from app.models.form import Form


def test_create_question(client, default_creator, db_session):
    form = Form(creator_id=default_creator.id, title="Test")
    db_session.add(form)
    db_session.commit()

    # Defaults and basic creation
    res = client.post(f"/api/forms/{form.id}/questions", json={"type": "short_text"})
    assert res.status_code == 201
    q1 = res.json()
    assert q1["title"] == ""
    assert q1["position"] == 0
    assert "placeholder" in q1["config"]

    # Options automatically added for choice types
    res = client.post(f"/api/forms/{form.id}/questions", json={"type": "multiple_choice"})
    q2 = res.json()
    assert len(q2["options"]) == 2
    assert q2["options"][0]["label"] == "Choice 1"

    # Options on unsupported type
    res = client.post(
        f"/api/forms/{form.id}/questions",
        json={"type": "short_text", "options": [{"label": "test"}]},
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "OPTIONS_NOT_SUPPORTED"

    # after_question_id positioning
    res = client.post(
        f"/api/forms/{form.id}/questions", json={"type": "number", "after_question_id": q1["id"]}
    )
    q3 = res.json()
    assert q3["position"] == 1

    # Check that q2 got shifted
    res = client.get(f"/api/forms/{form.id}")
    form_data = res.json()
    q2_latest = next(q for q in form_data["questions"] if q["id"] == q2["id"])
    assert q2_latest["position"] == 2

    # Limit to 100 questions
    for _ in range(97):
        client.post(f"/api/forms/{form.id}/questions", json={"type": "yes_no"})

    res = client.post(f"/api/forms/{form.id}/questions", json={"type": "yes_no"})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "QUESTION_LIMIT"
