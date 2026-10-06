import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.errors import AppError
from app.db.base import Base
from app.models.creator import Creator
from app.models.form import Form
from app.services.slug import (
    SLUG_CHARS,
    SLUG_LENGTH,
    generate_slug_string,
    generate_unique_form_slug,
)


@pytest.fixture
def temp_db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_slug_format():
    slug = generate_slug_string()
    assert len(slug) == SLUG_LENGTH
    assert all(c in SLUG_CHARS for c in slug)


def test_generate_unique_form_slug(temp_db_session):
    c = Creator(email="test@example.com", name="test")
    temp_db_session.add(c)
    temp_db_session.commit()

    slug = generate_unique_form_slug(temp_db_session)
    assert len(slug) == SLUG_LENGTH

    # insert form with that slug
    f = Form(creator_id=c.id, title="Test", slug=slug)
    temp_db_session.add(f)
    temp_db_session.commit()

    # generate another
    slug2 = generate_unique_form_slug(temp_db_session)
    assert slug2 != slug


def test_slug_collision_retry(temp_db_session, monkeypatch):
    c = Creator(email="test@example.com", name="test")
    temp_db_session.add(c)
    temp_db_session.commit()

    f = Form(creator_id=c.id, title="Test", slug="aaaaaaaa")
    temp_db_session.add(f)
    temp_db_session.commit()

    # Force the generator to return 'aaaaaaaa' for the first 3 tries, then 'bbbbbbbb'
    calls = []

    def mock_generate():
        calls.append(1)
        if len(calls) <= 3:
            return "aaaaaaaa"
        return "bbbbbbbb"

    monkeypatch.setattr("app.services.slug.generate_slug_string", mock_generate)

    slug = generate_unique_form_slug(temp_db_session)
    assert slug == "bbbbbbbb"
    assert len(calls) == 4


def test_slug_collision_failure(temp_db_session, monkeypatch):
    c = Creator(email="test@example.com", name="test")
    temp_db_session.add(c)
    temp_db_session.commit()

    f = Form(creator_id=c.id, title="Test", slug="aaaaaaaa")
    temp_db_session.add(f)
    temp_db_session.commit()

    monkeypatch.setattr("app.services.slug.generate_slug_string", lambda: "aaaaaaaa")

    with pytest.raises(AppError) as exc:
        generate_unique_form_slug(temp_db_session)

    assert exc.value.status_code == 500
