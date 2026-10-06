from app.models.form import Form
from app.models.question import Question


def test_delete_and_duplicate(client, default_creator, db_session):
    form = Form(creator_id=default_creator.id, title="Test")
    db_session.add(form)
    db_session.commit()

    q1 = Question(form_id=form.id, type="short_text", title="Q1", position=0)
    q2 = Question(form_id=form.id, type="short_text", title="Q2", position=1)
    q3 = Question(form_id=form.id, type="short_text", title="Q3", position=2)
    db_session.add_all([q1, q2, q3])
    db_session.commit()

    # Delete q2
    res = client.delete(f"/api/forms/{form.id}/questions/{q2.id}")
    assert res.status_code == 204

    # q3 position should shift to 1
    res = client.get(f"/api/forms/{form.id}")
    qs = res.json()["questions"]
    assert len(qs) == 2
    assert qs[0]["id"] == str(q1.id)
    assert qs[0]["position"] == 0
    assert qs[1]["id"] == str(q3.id)
    assert qs[1]["position"] == 1

    # Duplicate q1
    res = client.post(f"/api/forms/{form.id}/questions/{q1.id}/duplicate")
    assert res.status_code == 201
    q1_copy = res.json()
    assert q1_copy["title"] == "Q1"
    assert q1_copy["position"] == 1

    # Mutating copy should not affect q1
    client.patch(f"/api/forms/{form.id}/questions/{q1_copy['id']}", json={"title": "Q1 Copy"})

    res = client.get(f"/api/forms/{form.id}")
    qs = res.json()["questions"]
    assert len(qs) == 3
    assert qs[0]["id"] == str(q1.id)
    assert qs[0]["title"] == "Q1"
    assert qs[0]["position"] == 0

    assert qs[1]["id"] == q1_copy["id"]
    assert qs[1]["title"] == "Q1 Copy"
    assert qs[1]["position"] == 1

    assert qs[2]["id"] == str(q3.id)
    assert qs[2]["position"] == 2
