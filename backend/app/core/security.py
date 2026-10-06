from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.creator import Creator


def get_current_creator(db: Session = Depends(get_db)) -> Creator:
    """
    Get or create the default demo creator.
    NOTE: This is a documented swap-point for real authentication.
    """
    email = "demo@formly.app"
    creator = db.query(Creator).filter(Creator.email == email).first()
    if not creator:
        creator = Creator(email=email, name="Demo User")
        db.add(creator)
        db.commit()
        db.refresh(creator)
    return creator
