import json
import os

import pytest

from app.models.question import Question
from app.models.question_option import QuestionOption
from app.question_types.base import AnswerValidationError
from app.question_types.registry import _handlers, get_handler


def test_registry_completeness():
    expected_types = {
        "short_text",
        "long_text",
        "email",
        "number",
        "yes_no",
        "rating",
        "multiple_choice",
        "dropdown",
    }
    assert set(_handlers.keys()) == expected_types
    for t in expected_types:
        handler = get_handler(t)
        assert hasattr(handler, "validate_config")
        assert hasattr(handler, "normalize_answer")
        assert hasattr(handler, "format_answer")
        assert hasattr(handler, "calculate_stats")


def test_all_contract_cases():
    path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "contract", "validation-cases.json"
    )
    with open(path, "r", encoding="utf-8") as f:
        contract_cases = json.load(f)

    for q_type, cases in contract_cases.items():
        handler = get_handler(q_type)
        q = Question(id="q1", type=q_type)
        if q_type in ["multiple_choice", "dropdown"]:
            q.options = [
                QuestionOption(id="opt1", question_id="q1", label="Option 1", position=0),
                QuestionOption(id="opt2", question_id="q1", label="Option 2", position=1),
            ]

        for idx, case in enumerate(cases):
            if case["valid"]:
                ans = handler.normalize_answer(q, case["input"])
                assert ans is not None
            else:
                with pytest.raises(AnswerValidationError):
                    handler.normalize_answer(q, case["input"])
