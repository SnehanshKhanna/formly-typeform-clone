import json
import os

import pytest

from app.models.question import Question
from app.models.question_option import QuestionOption
from app.question_types.base import AnswerValidationError
from app.question_types.multiple_choice import MultipleChoiceHandler


@pytest.fixture
def contract_cases():
    path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "contract", "validation-cases.json"
    )
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_multiple_choice_contract(contract_cases):
    cases = contract_cases["multiple_choice"]
    q = Question(id="q1", type="multiple_choice")
    q.options = [
        QuestionOption(id="opt1", question_id="q1", label="Option 1", position=0),
        QuestionOption(id="opt2", question_id="q1", label="Option 2", position=1),
    ]
    for case in cases:
        if case["valid"]:
            ans = MultipleChoiceHandler.normalize_answer(q, case["input"])
            assert set(ans.option_ids) == set(case["input"])
        else:
            with pytest.raises(AnswerValidationError):
                MultipleChoiceHandler.normalize_answer(q, case["input"])
