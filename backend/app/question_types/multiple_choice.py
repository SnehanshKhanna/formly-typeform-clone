from typing import Any, Dict, List

from app.models.answer import Answer
from app.models.question import Question
from app.question_types.base import AnswerValidationError, NormalizedAnswer, QuestionTypeHandler


class MultipleChoiceHandler(QuestionTypeHandler):
    @classmethod
    def validate_config(cls, config: Dict[str, Any]) -> Dict[str, Any]:
        return config

    @classmethod
    def normalize_answer(cls, question: Question, answer_data: Any) -> NormalizedAnswer:
        if answer_data is None:
            raise AnswerValidationError("Answer cannot be null")
        if not isinstance(answer_data, list):
            raise AnswerValidationError("Answer must be a list of option IDs")
        if not answer_data:
            raise AnswerValidationError("Answer cannot be empty")

        option_ids = set()
        for opt in answer_data:
            if not isinstance(opt, str):
                raise AnswerValidationError("Option IDs must be strings")
            if opt in option_ids:
                raise AnswerValidationError("Duplicate option IDs")
            option_ids.add(opt)

        valid_option_ids = {opt.id for opt in question.options}
        if not option_ids.issubset(valid_option_ids):
            raise AnswerValidationError("Foreign or invalid option ID")

        return NormalizedAnswer(option_ids=list(option_ids))

    @classmethod
    def format_answer(cls, question: Question, answer: Answer) -> Any:
        return [ao.option_id for ao in answer.options]

    @classmethod
    def calculate_stats(cls, question: Question, answers: List[Answer]) -> Dict[str, Any]:
        stats = {}
        total = len(answers)
        for opt in question.options:
            stats[opt.id] = 0

        for ans in answers:
            for ao in ans.options:
                if ao.option_id in stats:
                    stats[ao.option_id] += 1

        return {"total_responses": total, "options": stats}


class DropdownHandler(MultipleChoiceHandler):
    @classmethod
    def normalize_answer(cls, question: Question, answer_data: Any) -> NormalizedAnswer:
        normalized = super().normalize_answer(question, answer_data)
        if len(normalized.option_ids) > 1:
            raise AnswerValidationError("Dropdown only allows a single selection")
        return normalized
