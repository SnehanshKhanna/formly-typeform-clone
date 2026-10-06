from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_creator
from app.db.session import get_db
from app.models.creator import Creator
from app.schemas.question import QuestionCreate, QuestionResponse, QuestionUpdate
from app.services import question_service

router = APIRouter(prefix="/forms/{id}/questions", tags=["questions"])


@router.post("", response_model=QuestionResponse, status_code=201)
def create_question(
    id: str,
    data: QuestionCreate,
    db: Session = Depends(get_db),
    creator: Creator = Depends(get_current_creator),
):
    return question_service.create_question(db, creator.id, id, data)


from typing import List

from pydantic import BaseModel


class ReorderRequest(BaseModel):
    ordered_ids: List[str]


@router.put("/reorder", response_model=List[QuestionResponse])
def reorder_questions(
    id: str,
    data: ReorderRequest,
    db: Session = Depends(get_db),
    creator: Creator = Depends(get_current_creator),
):
    return question_service.reorder_questions(db, creator.id, id, data.ordered_ids)


@router.patch("/{qid}", response_model=QuestionResponse)
def update_question(
    id: str,
    qid: str,
    data: QuestionUpdate,
    db: Session = Depends(get_db),
    creator: Creator = Depends(get_current_creator),
):
    return question_service.update_question(db, creator.id, id, qid, data)


@router.delete("/{qid}", status_code=204)
def delete_question(
    id: str,
    qid: str,
    db: Session = Depends(get_db),
    creator: Creator = Depends(get_current_creator),
):
    question_service.delete_question(db, creator.id, id, qid)


@router.post("/{qid}/duplicate", response_model=QuestionResponse, status_code=201)
def duplicate_question(
    id: str,
    qid: str,
    db: Session = Depends(get_db),
    creator: Creator = Depends(get_current_creator),
):
    return question_service.duplicate_question(db, creator.id, id, qid)
