from typing import Any, Dict, List

from app.models.answer import Answer
from app.models.question import Question
from app.question_types.base import AnswerValidationError, NormalizedAnswer, QuestionTypeHandler


class YesNoHandler(QuestionTypeHandler):
    @classmethod
    def validate_config(cls, config: Dict[str, Any]) -> Dict[str, Any]:
        return config

    @classmethod
    def normalize_answer(cls, question: Question, answer_data: Any) -> NormalizedAnswer:
        if answer_data is None:
            raise AnswerValidationError("Answer cannot be null")
        if not isinstance(answer_data, bool):
            raise AnswerValidationError("Answer must be a boolean")
        return NormalizedAnswer(value_boolean=answer_data)

    @classmethod
    def format_answer(cls, question: Question, answer: Answer) -> Any:
        return answer.value_boolean

    @classmethod
    def calculate_stats(cls, question: Question, answers: List[Answer]) -> Dict[str, Any]:
        yes_count = sum(1 for a in answers if a.value_bool is True)
        no_count = sum(1 for a in answers if a.value_bool is False)
        return {"total_responses": len(answers), "yes_count": yes_count, "no_count": no_count}


class RatingHandler(QuestionTypeHandler):
    @classmethod
    def validate_config(cls, config: Dict[str, Any]) -> Dict[str, Any]:
        return config

    @classmethod
    def normalize_answer(cls, question: Question, answer_data: Any) -> NormalizedAnswer:
        if answer_data is None:
            raise AnswerValidationError("Answer cannot be null")
        if isinstance(answer_data, bool):
            raise AnswerValidationError("Rating cannot be boolean")
        if not isinstance(answer_data, int):
            raise AnswerValidationError("Rating must be an integer")

        config = question.config or {}
        max_rating = config.get("max", 5)

        if answer_data < 1 or answer_data > max_rating:
            raise AnswerValidationError(f"Rating must be between 1 and {max_rating}")

        return NormalizedAnswer(value_number=float(answer_data))

    @classmethod
    def format_answer(cls, question: Question, answer: Answer) -> Any:
        return int(answer.value_number) if answer.value_number is not None else None

    @classmethod
    def calculate_stats(cls, question: Question, answers: List[Answer]) -> Dict[str, Any]:
        config = question.config or {}
        max_rating = config.get("max", config.get("steps", 5))

        dist = {str(i): 0 for i in range(1, max_rating + 1)}
        for a in answers:
            if a.value_number is not None:
                val = str(int(a.value_number))
                if val in dist:
                    dist[val] += 1

        return {"total_responses": len(answers), "distribution": dist}
