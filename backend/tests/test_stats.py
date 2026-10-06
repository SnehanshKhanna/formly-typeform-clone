import datetime

from app.models.answer import Answer
from app.models.answer_option import AnswerOption
from app.models.form import Form
from app.models.question import Question
from app.models.question_option import QuestionOption
from app.models.submission import Submission


def test_stats(client, default_creator, db_session):
    now = datetime.datetime.now(datetime.timezone.utc)
    form = Form(creator_id=default_creator.id, title="Test", status="published", published_at=now)
    db_session.add(form)
    db_session.flush()

    q_txt = Question(form_id=form.id, type="short_text", position=0)
    q_num = Question(form_id=form.id, type="number", position=1, config={"min": 0, "max": 100})
    q_yn = Question(form_id=form.id, type="yes_no", position=2)
    q_rating = Question(form_id=form.id, type="rating", position=3, config={"max": 5})
    q_mc = Question(form_id=form.id, type="multiple_choice", position=4)

    db_session.add_all([q_txt, q_num, q_yn, q_rating, q_mc])
    db_session.flush()

    opt1 = QuestionOption(question_id=q_mc.id, label="A", position=0)
    opt2 = QuestionOption(question_id=q_mc.id, label="B", position=1)
    db_session.add_all([opt1, opt2])
    db_session.flush()

    # Check zero-response form
    res = client.get(f"/api/forms/{form.id}/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["total_submissions"] == 0

    # Add submissions
    s1 = Submission(form_id=form.id, started_at=now, submitted_at=now)
    s2 = Submission(form_id=form.id, started_at=now, submitted_at=now)
    s_skipped = Submission(form_id=form.id, started_at=now, submitted_at=now)
    db_session.add_all([s1, s2, s_skipped])
    db_session.flush()

    # Answers for s1
    db_session.add_all(
        [
            Answer(submission_id=s1.id, question_id=q_txt.id, value_text="One"),
            Answer(submission_id=s1.id, question_id=q_num.id, value_number=10.0),
            Answer(submission_id=s1.id, question_id=q_yn.id, value_bool=True),
            Answer(submission_id=s1.id, question_id=q_rating.id, value_number=5.0),
        ]
    )
    ans_mc_s1 = Answer(submission_id=s1.id, question_id=q_mc.id)
    db_session.add(ans_mc_s1)
    db_session.flush()
    db_session.add(AnswerOption(answer_id=ans_mc_s1.id, option_id=opt1.id))

    # Answers for s2
    db_session.add_all(
        [
            Answer(submission_id=s2.id, question_id=q_txt.id, value_text="Two"),
            Answer(submission_id=s2.id, question_id=q_num.id, value_number=30.0),
            Answer(submission_id=s2.id, question_id=q_yn.id, value_bool=False),
            Answer(submission_id=s2.id, question_id=q_rating.id, value_number=3.0),
        ]
    )
    ans_mc_s2 = Answer(submission_id=s2.id, question_id=q_mc.id)
    db_session.add(ans_mc_s2)
    db_session.flush()
    db_session.add_all(
        [
            AnswerOption(answer_id=ans_mc_s2.id, option_id=opt1.id),
            AnswerOption(answer_id=ans_mc_s2.id, option_id=opt2.id),
        ]
    )

    db_session.commit()

    res = client.get(f"/api/forms/{form.id}/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["total_submissions"] == 3
    q_stats = data["question_stats"]

    # Skipped
    assert q_stats[str(q_txt.id)]["skipped"] == 1

    # Text recent-5
    assert "One" in q_stats[str(q_txt.id)]["recent"]
    assert "Two" in q_stats[str(q_txt.id)]["recent"]

    # Number min/max/avg
    assert q_stats[str(q_num.id)]["min"] == 10.0
    assert q_stats[str(q_num.id)]["max"] == 30.0
    assert q_stats[str(q_num.id)]["average"] == 20.0

    # Yes/no count
    assert q_stats[str(q_yn.id)]["yes_count"] == 1
    assert q_stats[str(q_yn.id)]["no_count"] == 1

    # Rating dist with zero buckets
    dist = q_stats[str(q_rating.id)]["distribution"]
    assert dist["1"] == 0
    assert dist["3"] == 1
    assert dist["5"] == 1

    # Choice option counts
    opts = q_stats[str(q_mc.id)]["options"]
    assert opts[str(opt1.id)] == 2
    assert opts[str(opt2.id)] == 1
