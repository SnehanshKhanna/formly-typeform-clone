from typing import Dict, Type

from app.core.errors import AppError
from app.question_types.base import QuestionTypeHandler

_handlers: Dict[str, Type[QuestionTypeHandler]] = {}


def register_handler(question_type: str, handler: Type[QuestionTypeHandler]):
    _handlers[question_type] = handler


def get_handler(question_type: str) -> Type[QuestionTypeHandler]:
    handler = _handlers.get(question_type)
    if not handler:
        raise AppError(
            code="UNKNOWN_QUESTION_TYPE",
            message=f"Unknown question type: {question_type}",
            status_code=400,
        )
    return handler
