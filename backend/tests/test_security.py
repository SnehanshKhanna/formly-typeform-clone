import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.security import get_current_creator
from app.db.base import Base


@pytest.fixture
def temp_db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_get_current_creator(temp_db_session):
    creator = get_current_creator(temp_db_session)
    assert creator is not None
    assert creator.email == "demo@formly.app"

    # Second call should return the same creator
    creator2 = get_current_creator(temp_db_session)
    assert creator.id == creator2.id
