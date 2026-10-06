import json
import os

import pytest

from app.models.answer import Answer
from app.models.question import Question
from app.question_types.base import AnswerValidationError
from app.question_types.text import LongTextHandler, ShortTextHandler


@pytest.fixture
def contract_cases():
    path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "contract", "validation-cases.json"
    )
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_short_text_contract(contract_cases):
    cases = contract_cases["short_text"]
    q = Question(id="q1", type="short_text")
    for case in cases:
        if case["valid"]:
            ans = ShortTextHandler.normalize_answer(q, case["input"])
            assert ans.value_text == case["input"]
        else:
            with pytest.raises(AnswerValidationError):
                ShortTextHandler.normalize_answer(q, case["input"])


def test_long_text_contract(contract_cases):
    cases = contract_cases["long_text"]
    q = Question(id="q1", type="long_text")
    for case in cases:
        if case["valid"]:
            ans = LongTextHandler.normalize_answer(q, case["input"])
            assert ans.value_text == case["input"]
        else:
            with pytest.raises(AnswerValidationError):
                LongTextHandler.normalize_answer(q, case["input"])


def test_text_stats():
    q = Question(id="q1", type="short_text")
    answers = [Answer(id=f"a{i}", value_text=f"val{i}") for i in range(10)]
    stats = ShortTextHandler.calculate_stats(q, answers)
    assert stats["total_responses"] == 10
    # recent should be top 5 sorted by id reverse
    # a9, a8, a7, a6, a5
    assert len(stats["recent"]) == 5
    assert stats["recent"][0] == "val9"
    assert stats["recent"][4] == "val5"
