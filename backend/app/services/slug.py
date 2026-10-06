import secrets
import string

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.form import Form

SLUG_CHARS = string.ascii_lowercase + string.digits
SLUG_LENGTH = 8
MAX_RETRIES = 5


def generate_slug_string() -> str:
    return "".join(secrets.choice(SLUG_CHARS) for _ in range(SLUG_LENGTH))


def generate_unique_form_slug(db: Session, max_retries: int = MAX_RETRIES) -> str:
    for _ in range(max_retries):
        slug = generate_slug_string()
        # Check collision
        exists = db.query(Form.id).filter(Form.slug == slug).first()
        if not exists:
            return slug
    raise AppError(
        code="INTERNAL_ERROR", message="Failed to generate a unique form slug", status_code=500
    )
