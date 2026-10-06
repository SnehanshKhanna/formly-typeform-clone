import datetime

from app.models.answer import Answer
from app.models.form import Form
from app.models.question import Question
from app.models.submission import Submission


def test_get_submissions(client, default_creator, db_session):
    now = datetime.datetime.now(datetime.timezone.utc)
    form = Form(creator_id=default_creator.id, title="Test", status="published", published_at=now)
    db_session.add(form)
    db_session.commit()

    q1 = Question(form_id=form.id, type="short_text", title="Q1", position=0)
    db_session.add(q1)
    db_session.commit()

    s1 = Submission(form_id=form.id, started_at=now, submitted_at=now)
    s2 = Submission(form_id=form.id, started_at=now, submitted_at=now)
    db_session.add_all([s1, s2])
    db_session.commit()

    ans = Answer(submission_id=s1.id, question_id=str(q1.id), value_text="Hello")
    db_session.add(ans)
    db_session.commit()

    # List (pagination, limits)
    res = client.get(f"/api/forms/{form.id}/submissions?page=1&page_size=1")
    assert res.status_code == 200
    subs = res.json()
    assert len(subs) == 1

    res = client.get(f"/api/forms/{form.id}/submissions?page=1&page_size=1000")
    assert res.status_code == 200
    assert len(res.json()) == 2

    # Get one
    res = client.get(f"/api/forms/{form.id}/submissions/{s1.id}")
    assert res.status_code == 200
    assert len(res.json()["answers"]) == 1
    assert res.json()["answers"][0]["value"] == "Hello"

    # 404 for other forms
    form2 = Form(creator_id=default_creator.id, title="Test 2")
    db_session.add(form2)
    db_session.commit()

    res = client.get(f"/api/forms/{form2.id}/submissions/{s1.id}")
    assert res.status_code == 404
