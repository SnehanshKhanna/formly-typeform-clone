import json
import os

import pytest

from app.models.question import Question
from app.question_types.base import AnswerValidationError
from app.question_types.choices import RatingHandler, YesNoHandler
from app.question_types.email_number import EmailHandler, NumberHandler


@pytest.fixture
def contract_cases():
    path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "contract", "validation-cases.json"
    )
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_email_contract(contract_cases):
    cases = contract_cases["email"]
    q = Question(id="q1", type="email")
    for case in cases:
        if case["valid"]:
            ans = EmailHandler.normalize_answer(q, case["input"])
            assert ans.value_text == case["input"]
        else:
            with pytest.raises(AnswerValidationError):
                EmailHandler.normalize_answer(q, case["input"])


def test_number_contract(contract_cases):
    cases = contract_cases["number"]
    q = Question(id="q1", type="number")
    for case in cases:
        if case["valid"]:
            ans = NumberHandler.normalize_answer(q, case["input"])
            assert ans.value_number == float(case["input"])
        else:
            with pytest.raises(AnswerValidationError):
                NumberHandler.normalize_answer(q, case["input"])


def test_yes_no_contract(contract_cases):
    cases = contract_cases["yes_no"]
    q = Question(id="q1", type="yes_no")
    for case in cases:
        if case["valid"]:
            ans = YesNoHandler.normalize_answer(q, case["input"])
            assert ans.value_boolean == case["input"]
        else:
            with pytest.raises(AnswerValidationError):
                YesNoHandler.normalize_answer(q, case["input"])


def test_rating_contract(contract_cases):
    cases = contract_cases["rating"]
    q = Question(id="q1", type="rating")
    for case in cases:
        if case["valid"]:
            ans = RatingHandler.normalize_answer(q, case["input"])
            assert ans.value_number == float(case["input"])
        else:
            with pytest.raises(AnswerValidationError):
                RatingHandler.normalize_answer(q, case["input"])
