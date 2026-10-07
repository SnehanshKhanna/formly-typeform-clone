from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Float,
    ForeignKey,
    Index,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.db.base import BaseModel


class Answer(BaseModel):
    __tablename__ = "answers"

    submission_id = Column(String, ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)

    value_text = Column(String, nullable=True)
    value_number = Column(Float, nullable=True)
    value_bool = Column(Boolean, nullable=True)

    question = relationship("Question")
    options = relationship(
        "AnswerOption", backref="answer", cascade="all, delete-orphan", passive_deletes=True
    )

    __table_args__ = (
        UniqueConstraint("submission_id", "question_id", name="uq_answer_submission_question"),
        CheckConstraint(
            """
            (value_text IS NOT NULL AND value_number IS NULL AND value_bool IS NULL) OR
            (value_text IS NULL AND value_number IS NOT NULL AND value_bool IS NULL) OR
            (value_text IS NULL AND value_number IS NULL AND value_bool IS NOT NULL) OR
            (value_text IS NULL AND value_number IS NULL AND value_bool IS NULL)
            """,
            name="check_answer_at_most_one_value",
        ),
        Index("ix_answers_question_id", "question_id"),
        Index("ix_answers_submission_id", "submission_id"),
    )

    @property
    def value(self):
        if self.value_text is not None:
            return self.value_text
        if self.value_number is not None:
            return self.value_number
        if self.value_bool is not None:
            return self.value_bool
        if self.options:
            labels = [
                opt.option.label if opt.option else str(opt.option_id) for opt in self.options
            ]
            return labels[0] if len(labels) == 1 else labels
        return None
