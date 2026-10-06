from sqlalchemy import Column, ForeignKey, Index, Integer, String

from app.db.base import BaseModel


class QuestionOption(BaseModel):
    __tablename__ = "question_options"

    question_id = Column(String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    label = Column(String, nullable=False)
    position = Column(Integer, nullable=False)

    __table_args__ = (Index("ix_question_options_question_position", "question_id", "position"),)
