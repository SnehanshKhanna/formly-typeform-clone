from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_creator
from app.db.session import get_db
from app.models.creator import Creator
from app.schemas.form import FormCreate, FormFullResponse, FormListResponse, FormUpdate
from app.schemas.submission import SubmissionResponse
from app.services import form_service

router = APIRouter(prefix="/forms", tags=["forms"])


@router.get("", response_model=FormListResponse)
def list_forms(
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    creator: Creator = Depends(get_current_creator),
):
    return form_service.list_forms(db, creator.id, q=q, status=status)


@router.post("", response_model=FormFullResponse, status_code=201)
def create_form(
    data: FormCreate, db: Session = Depends(get_db), creator: Creator = Depends(get_current_creator)
):
    return form_service.create_form(db, creator.id, data)


@router.get("/{id}", response_model=FormFullResponse)
def get_form(
    id: str, db: Session = Depends(get_db), creator: Creator = Depends(get_current_creator)
):
    return form_service.get_form(db, creator.id, id)


@router.patch("/{id}", response_model=FormFullResponse)
def update_form(
    id: str,
    data: FormUpdate,
    db: Session = Depends(get_db),
    creator: Creator = Depends(get_current_creator),
):
    return form_service.update_form(db, creator.id, id, data)


@router.delete("/{id}", status_code=204)
def delete_form(
    id: str, db: Session = Depends(get_db), creator: Creator = Depends(get_current_creator)
):
    form_service.delete_form(db, creator.id, id)


@router.post("/{id}/duplicate", response_model=FormFullResponse, status_code=201)
def duplicate_form(
    id: str, db: Session = Depends(get_db), creator: Creator = Depends(get_current_creator)
):
    return form_service.duplicate_form(db, creator.id, id)


@router.post("/{id}/publish", response_model=FormFullResponse)
def publish_form(
    id: str, db: Session = Depends(get_db), creator: Creator = Depends(get_current_creator)
):
    return form_service.publish_form(db, creator.id, id)


@router.post("/{id}/unpublish", response_model=FormFullResponse)
def unpublish_form(
    id: str, db: Session = Depends(get_db), creator: Creator = Depends(get_current_creator)
):
    return form_service.unpublish_form(db, creator.id, id)


from app.core.errors import AppError
from app.models.submission import Submission


@router.get("/{id}/submissions", response_model=List[SubmissionResponse])
def get_submissions(
    id: str,
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db),
    creator: Creator = Depends(get_current_creator),
):
    form = form_service._get_form_or_404(db, creator.id, id)
    page_size = min(page_size, 100)
    skip = (page - 1) * page_size
    subs = (
        db.query(Submission)
        .filter(Submission.form_id == form.id)
        .order_by(Submission.submitted_at.desc())
        .offset(skip)
        .limit(page_size)
        .all()
    )
    return subs


@router.get("/{id}/submissions/{sid}", response_model=SubmissionResponse)
def get_submission(
    id: str,
    sid: str,
    db: Session = Depends(get_db),
    creator: Creator = Depends(get_current_creator),
):
    form = form_service._get_form_or_404(db, creator.id, id)
    sub = db.query(Submission).filter(Submission.form_id == form.id, Submission.id == sid).first()
    if not sub:
        raise AppError("NOT_FOUND", "Submission not found", 404)
    return sub


from app.services.stats_service import get_form_stats


@router.get("/{id}/stats")
def get_stats(
    id: str, db: Session = Depends(get_db), creator: Creator = Depends(get_current_creator)
):
    # Authenticate via _get_form_or_404
    form_service._get_form_or_404(db, creator.id, id)
    return get_form_stats(db, id)
