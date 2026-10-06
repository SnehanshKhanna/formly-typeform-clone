from sqlalchemy import JSON, Boolean, CheckConstraint, Column, ForeignKey, Index, Integer, String
from sqlalchemy.orm import backref, relationship

from app.db.base import BaseModel


class Question(BaseModel):
    __tablename__ = "questions"

    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False, default="")
    description = Column(String, nullable=True)
    required = Column(Boolean, nullable=False, default=False)
    position = Column(Integer, nullable=False)
    config = Column(JSON, nullable=True)

    form = relationship(
        "Form", backref=backref("questions", passive_deletes=True, cascade="all, delete-orphan")
    )
    options = relationship(
        "QuestionOption", backref="question", cascade="all, delete-orphan", passive_deletes=True
    )

    __table_args__ = (
        CheckConstraint(
            "type IN ('short_text', 'long_text', 'multiple_choice', 'dropdown', 'email', 'number', 'yes_no', 'rating')",
            name="check_question_type_valid",
        ),
        Index("ix_questions_form_position", "form_id", "position"),
    )
