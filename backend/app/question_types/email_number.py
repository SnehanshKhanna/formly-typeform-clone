import math
import re
from typing import Any, Dict, List

from app.models.answer import Answer
from app.models.question import Question
from app.question_types.base import AnswerValidationError, NormalizedAnswer, QuestionTypeHandler

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class EmailHandler(QuestionTypeHandler):
    @classmethod
    def validate_config(cls, config: Dict[str, Any]) -> Dict[str, Any]:
        return config

    @classmethod
    def normalize_answer(cls, question: Question, answer_data: Any) -> NormalizedAnswer:
        if answer_data is None:
            raise AnswerValidationError("Answer cannot be null")
        if not isinstance(answer_data, str):
            raise AnswerValidationError("Email must be a string")
        if not answer_data.strip():
            raise AnswerValidationError("Email cannot be empty or whitespace")
        if not EMAIL_REGEX.match(answer_data):
            raise AnswerValidationError("Invalid email format")
        return NormalizedAnswer(value_text=answer_data)

    @classmethod
    def format_answer(cls, question: Question, answer: Answer) -> Any:
        return answer.value_text

    @classmethod
    def calculate_stats(cls, question: Question, answers: List[Answer]) -> Dict[str, Any]:
        recent = [a.value_text for a in sorted(answers, key=lambda x: x.id or "", reverse=True)[:5]]
        return {"total_responses": len(answers), "recent": recent}


class NumberHandler(QuestionTypeHandler):
    @classmethod
    def validate_config(cls, config: Dict[str, Any]) -> Dict[str, Any]:
        return config

    @classmethod
    def normalize_answer(cls, question: Question, answer_data: Any) -> NormalizedAnswer:
        if answer_data is None:
            raise AnswerValidationError("Answer cannot be null")
        if isinstance(answer_data, bool):
            raise AnswerValidationError("Number cannot be boolean")
        if not isinstance(answer_data, (int, float)):
            raise AnswerValidationError("Number must be an integer or float")
        if math.isnan(answer_data) or math.isinf(answer_data):
            raise AnswerValidationError("Number cannot be NaN or Inf")

        # Optional min/max from config
        config = question.config or {}
        min_val = config.get("min")
        max_val = config.get("max")
        if min_val is not None and answer_data < min_val:
            raise AnswerValidationError(f"Number must be >= {min_val}")
        if max_val is not None and answer_data > max_val:
            raise AnswerValidationError(f"Number must be <= {max_val}")

        return NormalizedAnswer(value_number=float(answer_data))

    @classmethod
    def format_answer(cls, question: Question, answer: Answer) -> Any:
        return answer.value_number

    @classmethod
    def calculate_stats(cls, question: Question, answers: List[Answer]) -> Dict[str, Any]:
        vals = [a.value_number for a in answers if a.value_number is not None]
        avg = sum(vals) / len(vals) if vals else 0
        return {
            "total_responses": len(answers),
            "average": avg,
            "min": min(vals) if vals else None,
            "max": max(vals) if vals else None,
        }
