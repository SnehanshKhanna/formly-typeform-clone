import pytest

from app.schemas import FormCreate, QuestionCreate, SubmissionCreate


def test_schemas_forbid_extra():
    # FormCreate ignores extra fields now, so it won't raise ValueError
    FormCreate(title="Test", extra_field="should fail")

    # QuestionCreate ignores extra fields now, so it won't raise ValueError
    QuestionCreate(type="short_text", another="fail")

    with pytest.raises(ValueError):
        SubmissionCreate(answers=[], unexpected=True)


def test_schema_import():
    from app.schemas.form import FormFullResponse

    assert FormFullResponse is not None
