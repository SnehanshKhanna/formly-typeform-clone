from sqlalchemy import Column, ForeignKey, String

from app.db.base import Base


class AnswerOption(Base):
    __tablename__ = "answer_options"

    answer_id = Column(String, ForeignKey("answers.id", ondelete="CASCADE"), primary_key=True)
    option_id = Column(
        String, ForeignKey("question_options.id", ondelete="CASCADE"), primary_key=True
    )
