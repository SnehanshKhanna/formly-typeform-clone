from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.public import PublicFormResponse
from app.schemas.submission import SubmissionCreate
from app.services import public_service

router = APIRouter(prefix="/public/forms", tags=["public"])


@router.get("/{slug}", response_model=PublicFormResponse)
def get_public_form(slug: str, response: Response, db: Session = Depends(get_db)):
    form = public_service.get_public_form(db, slug)
    response.headers["Cache-Control"] = "no-store"
    return form


@router.post("/{slug}/submissions", status_code=201)
def submit_form(slug: str, data: SubmissionCreate, db: Session = Depends(get_db)):
    return public_service.submit_form(db, slug, data)

