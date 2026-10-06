from app.models.form import Form
from app.models.question import Question
from app.models.question_option import QuestionOption


def test_duplicate_form(client, default_creator, db_session):
    # Setup original form with questions and options
    form = Form(creator_id=default_creator.id, title="Original Form")
    db_session.add(form)
    db_session.commit()
    db_session.refresh(form)

    q1 = Question(form_id=form.id, type="multiple_choice", title="Q1", position=0)
    db_session.add(q1)
    db_session.commit()
    db_session.refresh(q1)

    opt1 = QuestionOption(question_id=q1.id, label="Opt1", position=0)
    db_session.add(opt1)
    db_session.commit()

    # Call API
    res = client.post(f"/api/forms/{form.id}/duplicate")
    assert res.status_code == 201
    copy = res.json()

    assert copy["id"] != form.id
    assert copy["title"] == "Copy of Original Form"
    assert copy["slug"] != form.slug
    assert copy["status"] == "draft"

    assert len(copy["questions"]) == 1
    copy_q = copy["questions"][0]
    assert copy_q["id"] != q1.id
    assert copy_q["title"] == "Q1"

    assert len(copy_q["options"]) == 1
    assert copy_q["options"][0]["id"] != opt1.id
    assert copy_q["options"][0]["label"] == "Opt1"

    # Verify independence: mutate copy
    client.patch(f"/api/forms/{copy['id']}", json={"title": "Mutated Copy"})

    # Original should be unchanged
    res_orig = client.get(f"/api/forms/{form.id}")
    assert res_orig.json()["title"] == "Original Form"
