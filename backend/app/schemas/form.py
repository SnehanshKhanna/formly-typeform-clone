from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from .common import BaseSchema
from .question import QuestionResponse


class FormBase(BaseSchema):
    title: Optional[str] = Field("Untitled form", max_length=255)


class FormCreate(FormBase):
    pass


class FormUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=10000)
    thank_you_title: Optional[str] = Field(None, max_length=255)
    thank_you_message: Optional[str] = Field(None, max_length=10000)
    theme: Optional[Dict[str, Any]] = None


class FormResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    slug: str
    thank_you_title: Optional[str] = None
    thank_you_message: Optional[str] = None
    theme: Optional[Dict[str, Any]] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class FormFullResponse(FormResponse):
    questions: List[QuestionResponse] = []


class FormSummaryResponse(BaseModel):
    id: str
    title: str
    status: str
    slug: str
    question_count: int = 0
    response_count: int = 0
    updated_at: datetime
    published_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class FormListResponse(BaseModel):
    items: List[FormSummaryResponse]
    total: int
