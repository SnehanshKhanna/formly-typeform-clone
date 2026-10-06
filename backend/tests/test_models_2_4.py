from datetime import datetime

import pytest
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.models.creator import Creator
from app.models.form import Form


@pytest.fixture
def temp_db_session():
    engine = create_engine("sqlite:///:memory:")
    # Create all tables
    Base.metadata.create_all(engine)

    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_form_published_check(temp_db_session):
    creator = Creator(email="test@example.com", name="Test")
    temp_db_session.add(creator)
    temp_db_session.commit()

    # Draft is fine
    form1 = Form(creator_id=creator.id, title="Draft Form", status="draft")
    temp_db_session.add(form1)
    temp_db_session.commit()

    # Published with published_at is fine
    form2 = Form(
        creator_id=creator.id, title="Pub Form", status="published", published_at=datetime.utcnow()
    )
    temp_db_session.add(form2)
    temp_db_session.commit()

    # Published without published_at fails
    form3 = Form(creator_id=creator.id, title="Bad Form", status="published")
    temp_db_session.add(form3)
    with pytest.raises(IntegrityError):
        temp_db_session.commit()
