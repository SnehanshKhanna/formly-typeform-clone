import pytest

from app.core.errors import AppError
from app.question_types.base import QuestionTypeHandler
from app.question_types.registry import get_handler, register_handler


def test_registry_lookup_unknown():
    with pytest.raises(AppError) as exc:
        get_handler("unknown_type")
    assert exc.value.code == "UNKNOWN_QUESTION_TYPE"
    assert exc.value.status_code == 400


def test_registry_lookup_known():
    class DummyHandler(QuestionTypeHandler):
        pass

    register_handler("dummy", DummyHandler)
    handler = get_handler("dummy")
    assert handler is DummyHandler
