import secrets

from sqlalchemy import JSON, CheckConstraint, Column, ForeignKey, Index, String
from sqlalchemy.orm import backref, relationship

from app.db.base import BaseModel
from app.db.types import UTCDateTime


def generate_slug():
    return secrets.token_urlsafe(6)[:8]


class Form(BaseModel):
    __tablename__ = "forms"

    creator_id = Column(String, ForeignKey("creators.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False, default="Untitled form")
    description = Column(String, nullable=True)
    status = Column(String, nullable=False, default="draft")
    slug = Column(String, unique=True, nullable=False, default=generate_slug, index=True)
    thank_you_title = Column(String, nullable=True, default="Thank you!")
    thank_you_message = Column(String, nullable=True, default="Your response has been recorded.")
    theme = Column(JSON, nullable=False, default={})
    published_at = Column(UTCDateTime, nullable=True)

    creator = relationship(
        "Creator", backref=backref("forms", passive_deletes=True, cascade="all, delete-orphan")
    )

    __table_args__ = (
        CheckConstraint("status IN ('draft', 'published')", name="check_form_status_valid"),
        CheckConstraint(
            "(status = 'published' AND published_at IS NOT NULL) OR (status = 'draft')",
            name="check_form_published_at",
        ),
        Index("ix_forms_creator_updated", "creator_id", "updated_at"),
    )
