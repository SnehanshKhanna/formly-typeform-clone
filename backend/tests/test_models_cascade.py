from datetime import datetime

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.models.answer import Answer
from app.models.answer_option import AnswerOption
from app.models.creator import Creator
from app.models.form import Form
from app.models.question import Question
from app.models.question_option import QuestionOption
from app.models.submission import Submission


@pytest.fixture
def temp_db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    session.execute(text("PRAGMA foreign_keys=ON"))
    yield session
    session.close()


def test_cascade_delete(temp_db_session):
    c = Creator(email="cascade@example.com", name="Cascade")
    temp_db_session.add(c)
    temp_db_session.commit()

    f = Form(creator_id=c.id, title="Cascading Form")
    temp_db_session.add(f)
    temp_db_session.commit()

    q = Question(form_id=f.id, type="multiple_choice", position=0)
    temp_db_session.add(q)
    temp_db_session.commit()

    qo = QuestionOption(question_id=q.id, label="Op1", position=0)
    temp_db_session.add(qo)
    temp_db_session.commit()

    s = Submission(form_id=f.id, started_at=datetime.utcnow())
    temp_db_session.add(s)
    temp_db_session.commit()

    a = Answer(submission_id=s.id, question_id=q.id)
    temp_db_session.add(a)
    temp_db_session.commit()

    ao = AnswerOption(answer_id=a.id, option_id=qo.id)
    temp_db_session.add(ao)
    temp_db_session.commit()

    # Delete form
    temp_db_session.delete(f)
    temp_db_session.commit()

    # Verify everything is deleted
    assert temp_db_session.query(Form).count() == 0
    assert temp_db_session.query(Question).count() == 0
    assert temp_db_session.query(QuestionOption).count() == 0
    assert temp_db_session.query(Submission).count() == 0
    assert temp_db_session.query(Answer).count() == 0
    assert temp_db_session.query(AnswerOption).count() == 0
