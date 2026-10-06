from app.models.form import Form
from app.models.question import Question
from app.models.submission import Submission
from app.services.stats_service import get_form_stats
from seed import run_seed


def test_seed(db_session):
    # Run once
    run_seed(db_session)

    forms = db_session.query(Form).all()
    assert len(forms) == 3

    f1 = db_session.query(Form).filter_by(slug="demo-form-1").first()
    f2 = db_session.query(Form).filter_by(slug="demo-form-2").first()
    f3 = db_session.query(Form).filter_by(slug="demo-draft").first()

    assert db_session.query(Submission).filter_by(form_id=f1.id).count() == 28
    assert db_session.query(Submission).filter_by(form_id=f2.id).count() == 18
    assert db_session.query(Submission).filter_by(form_id=f3.id).count() == 0

    stats1 = get_form_stats(db_session, str(f1.id))
    assert stats1["total_submissions"] == 28

    stats2 = get_form_stats(db_session, str(f2.id))
    assert stats2["total_submissions"] == 18

    # 8 types present
    q_types = set([q.type for q in db_session.query(Question).all()])
    assert q_types == {
        "short_text",
        "long_text",
        "number",
        "rating",
        "yes_no",
        "multiple_choice",
        "dropdown",
        "email",
    }

    # Run twice
    run_seed(db_session)

    # Counts unchanged
    forms_after = db_session.query(Form).all()
    assert len(forms_after) == 3

    assert db_session.query(Submission).filter_by(form_id=f1.id).count() == 28
    assert db_session.query(Submission).filter_by(form_id=f2.id).count() == 18
    assert db_session.query(Submission).filter_by(form_id=f3.id).count() == 0
