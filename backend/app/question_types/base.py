from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class NormalizedAnswer(BaseModel):
    value_text: Optional[str] = None
    value_number: Optional[float] = None
    value_boolean: Optional[bool] = None
    option_ids: List[str] = []


class AnswerValidationError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class QuestionTypeHandler:
    @classmethod
    def validate_config(cls, config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate question configuration."""
        raise NotImplementedError

    @classmethod
    def normalize_answer(cls, question: Any, answer_data: Any) -> NormalizedAnswer:
        """Validate and normalize a submitted answer."""
        raise NotImplementedError

    @classmethod
    def format_answer(cls, question: Any, answer: Any) -> Any:
        """Format an answer for display/API."""
        raise NotImplementedError

    @classmethod
    def get_stats(cls, question: Any, answers: List[Any]) -> Dict[str, Any]:
        """Generate statistics from answers."""
        raise NotImplementedError

    @classmethod
    def calculate_stats(cls, question: Any, answers: List[Any]) -> Dict[str, Any]:
        """Calculate statistics for the question."""
        return {"total_responses": len(answers)}
