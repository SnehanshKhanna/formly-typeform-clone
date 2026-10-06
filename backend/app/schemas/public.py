from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict

from .question import QuestionResponse


class PublicFormResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    custom_theme: Optional[Dict[str, Any]] = None
    thank_you_title: Optional[str] = None
    thank_you_message: Optional[str] = None
    questions: List[QuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)
