from typing import Any, Dict, List, Optional

from pydantic import Field

from .common import BaseSchema


class QuestionOptionBase(BaseSchema):
    label: str = Field(..., max_length=255)


class QuestionOptionCreate(QuestionOptionBase):
    pass


class QuestionOptionUpdate(BaseSchema):
    id: Optional[str] = None
    label: str = Field(..., max_length=255)


class QuestionOptionResponse(QuestionOptionBase):
    id: str
    question_id: str
    position: int
    model_config = {"from_attributes": True, "extra": "ignore"}


class QuestionBase(BaseSchema):
    type: str
    title: Optional[str] = Field(None, max_length=10000)
    description: Optional[str] = Field(None, max_length=10000)
    required: Optional[bool] = False
    config: Optional[Dict[str, Any]] = None


class QuestionCreate(QuestionBase):
    options: Optional[List[QuestionOptionCreate]] = None
    after_question_id: Optional[str] = None


class QuestionUpdate(BaseSchema):
    type: Optional[str] = None
    title: Optional[str] = Field(None, max_length=10000)
    description: Optional[str] = Field(None, max_length=10000)
    required: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None
    options: Optional[List[QuestionOptionUpdate]] = None


class QuestionResponse(BaseSchema):
    id: str
    form_id: str
    type: str
    title: Optional[str]
    description: Optional[str]
    required: bool
    position: int
    config: Optional[Dict[str, Any]] = None
    options: List[QuestionOptionResponse] = []
    model_config = {"from_attributes": True, "extra": "ignore"}
