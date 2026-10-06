import datetime

from app.core.security import get_current_creator
from app.main import app
from app.models.answer import Answer
from app.models.answer_option import AnswerOption
from app.models.form import Form
from app.models.question import Question
from app.models.question_option import QuestionOption
from app.models.submission import Submission


def test_cascade_ownership(client, default_creator, second_creator, db_session):
    now = datetime.datetime.now(datetime.timezone.utc)

    form = Form(creator_id=default_creator.id, title="Form", status="published", published_at=now)
    db_session.add(form)
    db_session.commit()

    q1 = Question(form_id=form.id, type="short_text", title="Q1", position=0)
    q_mc = Question(form_id=form.id, type="multiple_choice", title="MC", position=1)
    db_session.add_all([q1, q_mc])
    db_session.commit()

    opt1 = QuestionOption(question_id=q_mc.id, label="A", position=0)
    opt2 = QuestionOption(question_id=q_mc.id, label="B", position=1)
    db_session.add_all([opt1, opt2])
    db_session.commit()

    # Add submission
    s1 = Submission(form_id=form.id, started_at=now, submitted_at=now)
    db_session.add(s1)
    db_session.commit()

    ans = Answer(submission_id=s1.id, question_id=str(q_mc.id))
    db_session.add(ans)
    db_session.commit()

    ans_opt1 = AnswerOption(answer_id=ans.id, option_id=str(opt1.id))
    ans_opt2 = AnswerOption(answer_id=ans.id, option_id=str(opt2.id))
    db_session.add_all([ans_opt1, ans_opt2])
    db_session.commit()

    # 1. Ownership tests
    def override_get_current_creator():
        return second_creator

    app.dependency_overrides[get_current_creator] = override_get_current_creator

    # Try to access as second_creator
    res = client.get(f"/api/forms/{form.id}")
    assert res.status_code == 404

    res = client.delete(f"/api/forms/{form.id}")
    assert res.status_code == 404

    res = client.delete(f"/api/forms/{form.id}/questions/{q1.id}")
    assert res.status_code == 404

    app.dependency_overrides.pop(get_current_creator, None)

    # 2. Cascade: delete option via PATCH question
    res = client.patch(
        f"/api/forms/{form.id}/questions/{q_mc.id}",
        json={
            "options": [{"id": str(opt1.id), "label": "A"}]  # Omitting opt2
        },
    )
    print(res.json())
    assert res.status_code == 200

    # Option deleted, answer_option deleted
    assert db_session.query(QuestionOption).count() == 1
    assert db_session.query(AnswerOption).count() == 1

    # 3. Cascade: delete question
    res = client.delete(f"/api/forms/{form.id}/questions/{q_mc.id}")
    assert res.status_code == 204

    # Question deleted, options deleted, answers deleted, answer_options deleted
    assert db_session.query(Question).count() == 1
    assert db_session.query(QuestionOption).count() == 0
    assert db_session.query(Answer).count() == 0
    assert db_session.query(AnswerOption).count() == 0

    # 4. Cascade: delete form
    # Re-add some data to test form cascade
    q2 = Question(form_id=form.id, type="short_text", title="Q2", position=0)
    db_session.add(q2)
    db_session.commit()
    ans2 = Answer(submission_id=s1.id, question_id=str(q2.id), value_text="test")
    db_session.add(ans2)
    db_session.commit()

    res = client.delete(f"/api/forms/{form.id}")
    assert res.status_code == 204

    # Everything gone
    assert db_session.query(Form).count() == 0
    assert db_session.query(Question).count() == 0
    assert db_session.query(Submission).count() == 0
    assert db_session.query(Answer).count() == 0
