from datetime import datetime

import pytest
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.models.answer import Answer
from app.models.creator import Creator
from app.models.form import Form
from app.models.question import Question
from app.models.submission import Submission


@pytest.fixture
def temp_db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_question_type_check(temp_db_session):
    creator = Creator(email="q@example.com", name="Q")
    temp_db_session.add(creator)
    temp_db_session.commit()
    form = Form(creator_id=creator.id)
    temp_db_session.add(form)
    temp_db_session.commit()

    q1 = Question(form_id=form.id, type="short_text", position=0)
    temp_db_session.add(q1)
    temp_db_session.commit()

    q2 = Question(form_id=form.id, type="invalid_type", position=1)
    temp_db_session.add(q2)
    with pytest.raises(IntegrityError):
        temp_db_session.commit()


def test_answer_constraints(temp_db_session):
    creator = Creator(email="a@example.com", name="A")
    temp_db_session.add(creator)
    temp_db_session.commit()
    form = Form(creator_id=creator.id)
    temp_db_session.add(form)
    temp_db_session.commit()
    q = Question(form_id=form.id, type="short_text", position=0)
    temp_db_session.add(q)
    sub = Submission(form_id=form.id, started_at=datetime.utcnow())
    temp_db_session.add(sub)
    temp_db_session.commit()

    # Valid answer
    a1 = Answer(submission_id=sub.id, question_id=q.id, value_text="Hello")
    temp_db_session.add(a1)
    temp_db_session.commit()

    # Duplicate answer for same submission/question should fail
    a2 = Answer(submission_id=sub.id, question_id=q.id, value_number=123)
    temp_db_session.add(a2)
    with pytest.raises(IntegrityError):
        temp_db_session.commit()
    temp_db_session.rollback()

    # Two values set should fail
    q2 = Question(form_id=form.id, type="number", position=1)
    temp_db_session.add(q2)
    temp_db_session.commit()

    a3 = Answer(submission_id=sub.id, question_id=q2.id, value_text="Bad", value_number=123)
    temp_db_session.add(a3)
    with pytest.raises(IntegrityError):
        temp_db_session.commit()
