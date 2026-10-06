from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel

from .common import BaseSchema


class AnswerCreate(BaseSchema):
    question_id: str
    value: Any


class SubmissionCreate(BaseSchema):
    answers: List[AnswerCreate]


class AnswerResponse(BaseModel):
    question_id: str
    value: Any
    model_config = {"from_attributes": True}


class SubmissionResponse(BaseModel):
    id: str
    form_id: str
    status: str
    started_at: datetime
    submitted_at: Optional[datetime] = None
    answers: List[AnswerResponse] = []
    model_config = {"from_attributes": True}


class SubmissionListResponse(BaseModel):
    items: List[SubmissionResponse]
    total: int
    page: int
    page_size: int
