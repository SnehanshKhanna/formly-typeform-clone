from sqlalchemy import CheckConstraint, Column, ForeignKey, Index, String
from sqlalchemy.orm import backref, relationship

from app.db.base import BaseModel
from app.db.types import UTCDateTime


class Submission(BaseModel):
    __tablename__ = "submissions"

    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False, default="completed")
    started_at = Column(UTCDateTime, nullable=False)
    submitted_at = Column(UTCDateTime, nullable=True)

    form = relationship(
        "Form", backref=backref("submissions", passive_deletes=True, cascade="all, delete-orphan")
    )
    answers = relationship(
        "Answer", backref="submission", cascade="all, delete-orphan", passive_deletes=True
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('in_progress', 'completed')", name="check_submission_status_valid"
        ),
        Index("ix_submissions_form_submitted", "form_id", "submitted_at"),
    )
