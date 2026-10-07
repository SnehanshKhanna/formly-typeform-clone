from app.models.form import Form
from app.models.question import Question
from app.models.question_option import QuestionOption


def test_update_question(client, default_creator, db_session):
    form = Form(creator_id=default_creator.id, title="Test")
    db_session.add(form)
    db_session.commit()

    q1 = Question(
        form_id=form.id,
        type="multiple_choice",
        title="Q1",
        position=0,
        config={"allow_multiple": False},
    )
    db_session.add(q1)
    db_session.commit()

    opt1 = QuestionOption(question_id=q1.id, label="A", position=0)
    opt2 = QuestionOption(question_id=q1.id, label="B", position=1)
    db_session.add_all([opt1, opt2])
    db_session.commit()

    # partial update
    res = client.patch(f"/api/forms/{form.id}/questions/{q1.id}", json={"title": "Q1 Updated"})
    assert res.status_code == 200
    assert res.json()["title"] == "Q1 Updated"

    # type immutability (same type = no-op)
    res = client.patch(f"/api/forms/{form.id}/questions/{q1.id}", json={"type": "multiple_choice"})
    assert res.status_code == 200

    # type immutability (diff type = 422)
    res = client.patch(f"/api/forms/{form.id}/questions/{q1.id}", json={"type": "short_text"})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "QUESTION_TYPE_IMMUTABLE"

    # position is ignored (extra field)
    res = client.patch(f"/api/forms/{form.id}/questions/{q1.id}", json={"position": 10})
    assert res.status_code == 200

    # option sync
    res = client.patch(
        f"/api/forms/{form.id}/questions/{q1.id}",
        json={
            "options": [
                {"id": str(opt1.id), "label": "A Updated"},
                {"label": "C"},  # new option
            ]
        },
    )
    assert res.status_code == 200
    opts = res.json()["options"]
    assert len(opts) == 2
    assert opts[0]["label"] == "A Updated"
    assert opts[1]["label"] == "C"

    # foreign id 422
    res = client.patch(
        f"/api/forms/{form.id}/questions/{q1.id}",
        json={"options": [{"id": "999", "label": "Invalid"}]},
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "INVALID_OPTION_ID"
