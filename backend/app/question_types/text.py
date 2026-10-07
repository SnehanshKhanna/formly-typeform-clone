from typing import Any, Dict, List

from app.models.answer import Answer
from app.models.question import Question
from app.question_types.base import AnswerValidationError, NormalizedAnswer, QuestionTypeHandler


class ShortTextHandler(QuestionTypeHandler):
    @classmethod
    def validate_config(cls, config: Dict[str, Any]) -> Dict[str, Any]:
        return config

    @classmethod
    def normalize_answer(cls, question: Question, answer_data: Any) -> NormalizedAnswer:
        if answer_data is None:
            raise AnswerValidationError("Answer cannot be null")
        if not isinstance(answer_data, str):
            raise AnswerValidationError("Answer must be a string")
        if not answer_data.strip():
            raise AnswerValidationError("Answer cannot be empty or whitespace")
        if len(answer_data) > 255:
            raise AnswerValidationError("Answer too long")
        return NormalizedAnswer(value_text=answer_data)

    @classmethod
    def format_answer(cls, question: Question, answer: Answer) -> Any:
        return answer.value_text

    @classmethod
    def get_stats(cls, question: Question, answers: List[Answer]) -> Dict[str, Any]:
        return {"recent_responses": [a.value_text for a in answers if a.value_text is not None][:5]}

    @classmethod
    def calculate_stats(cls, question: Question, answers: List[Answer]) -> Dict[str, Any]:
        # For simplicity, take the last 5 in reverse order
        sorted_ans = sorted(answers, key=lambda x: x.id or "", reverse=True)
        recent = [a.value_text for a in sorted_ans[:5]]
        return {"total_responses": len(answers), "recent": recent}


class LongTextHandler(QuestionTypeHandler):
    @classmethod
    def validate_config(cls, config: Dict[str, Any]) -> Dict[str, Any]:
        return config

    @classmethod
    def normalize_answer(cls, question: Question, answer_data: Any) -> NormalizedAnswer:
        if answer_data is None:
            raise AnswerValidationError("Answer cannot be null")
        if not isinstance(answer_data, str):
            raise AnswerValidationError("Answer must be a string")
        if not answer_data.strip():
            raise AnswerValidationError("Answer cannot be empty or whitespace")
        return NormalizedAnswer(value_text=answer_data)

    @classmethod
    def format_answer(cls, question: Question, answer: Answer) -> Any:
        return answer.value_text

    @classmethod
    def calculate_stats(cls, question: Question, answers: List[Answer]) -> Dict[str, Any]:
        recent = [a.value_text for a in sorted(answers, key=lambda x: x.id or "", reverse=True)[:5]]
        return {"total_responses": len(answers), "recent": recent}
