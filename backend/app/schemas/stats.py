from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class QuestionStatsResponse(BaseModel):
    question_id: str
    type: str
    answered_count: int
    skipped_count: int
    details: Dict[str, Any]


class FormStatsResponse(BaseModel):
    total_responses: int
    last_response_at: Optional[datetime] = None
    questions: List[QuestionStatsResponse]
