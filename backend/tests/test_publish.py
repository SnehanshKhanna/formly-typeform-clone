from app.models.form import Form
from app.models.question import Question
from app.models.question_option import QuestionOption


def test_publish_validation(client, default_creator, db_session):
    # Setup empty form
    form = Form(creator_id=default_creator.id, title="Empty Form")
    db_session.add(form)
    db_session.commit()
    db_session.refresh(form)

    # 1. Test empty form fails
    res = client.post(f"/api/forms/{form.id}/publish")
    assert res.status_code == 422
    err = res.json()["error"]
    assert err["code"] == "PUBLISH_VALIDATION_FAILED"
    assert err["fields"][0]["code"] == "NO_QUESTIONS"

    # Add questions
    q1 = Question(form_id=form.id, type="short_text", title="", position=0)  # empty title
    q2 = Question(
        form_id=form.id, type="multiple_choice", title="Choices", position=1
    )  # no options
    q3 = Question(
        form_id=form.id, type="dropdown", title="Dropdown", position=2
    )  # options but empty
    db_session.add_all([q1, q2, q3])
    db_session.commit()

    opt = QuestionOption(question_id=q3.id, label="   ", position=0)
    db_session.add(opt)
    db_session.commit()

    # 2. Test multiple errors
    res = client.post(f"/api/forms/{form.id}/publish")
    assert res.status_code == 422
    err = res.json()["error"]
    assert len(err["fields"]) == 3

    # Fix questions
    q1.title = "Valid Title"
    opt2 = QuestionOption(question_id=q2.id, label="Valid Option", position=0)
    opt.label = "Valid Dropdown"
    db_session.add(opt2)
    db_session.commit()

    # 3. Publish success
    res = client.post(f"/api/forms/{form.id}/publish")
    assert res.status_code == 200
    assert res.json()["status"] == "published"
    assert res.json()["published_at"] is not None

    slug1 = res.json()["slug"]

    # Unpublish
    res = client.post(f"/api/forms/{form.id}/unpublish")
    assert res.status_code == 200
    assert res.json()["status"] == "draft"

    # Republish (idempotency/stable slug)
    res = client.post(f"/api/forms/{form.id}/publish")
    assert res.status_code == 200
    assert res.json()["slug"] == slug1
    # published_at should technically update or stay same?
    # Usually it might stay same if we only set if not published_at
    # The requirement is "slug stable on republish".
