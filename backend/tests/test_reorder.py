from app.models.form import Form
from app.models.question import Question


def test_reorder_questions(client, default_creator, db_session):
    form = Form(creator_id=default_creator.id, title="Test")
    db_session.add(form)
    db_session.commit()

    q1 = Question(form_id=form.id, type="short_text", title="Q1", position=0)
    q2 = Question(form_id=form.id, type="short_text", title="Q2", position=1)
    q3 = Question(form_id=form.id, type="short_text", title="Q3", position=2)
    db_session.add_all([q1, q2, q3])
    db_session.commit()

    id1, id2, id3 = str(q1.id), str(q2.id), str(q3.id)

    # 1. Success case
    res = client.put(
        f"/api/forms/{form.id}/questions/reorder", json={"ordered_ids": [id3, id1, id2]}
    )
    assert res.status_code == 200
    qs = res.json()
    assert qs[0]["id"] == id3
    assert qs[1]["id"] == id1
    assert qs[2]["id"] == id2

    # 2. Missing id
    res = client.put(f"/api/forms/{form.id}/questions/reorder", json={"ordered_ids": [id1, id2]})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "REORDER_MISMATCH"

    # 3. Extra id
    res = client.put(
        f"/api/forms/{form.id}/questions/reorder",
        json={"ordered_ids": [id1, id2, id3, "invalid-id"]},
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "REORDER_MISMATCH"

    # 4. Duplicate id
    res = client.put(
        f"/api/forms/{form.id}/questions/reorder", json={"ordered_ids": [id1, id2, id1]}
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "REORDER_MISMATCH"

    # Verify no changes on error
    res = client.get(f"/api/forms/{form.id}")
    qs = res.json()["questions"]
    assert qs[0]["id"] == id3  # From successful reorder
