import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.form import Form
from app.models.question import Question
from app.models.question_option import QuestionOption
from app.models.submission import Submission
from app.schemas.form import FormCreate, FormUpdate
from app.services.slug import generate_unique_form_slug


def _get_form_or_404(db: Session, creator_id: str, form_id: str) -> Form:
    try:
        uuid.UUID(form_id)
    except ValueError:
        raise AppError("FORM_NOT_FOUND", "Form not found", 404)

    form = db.query(Form).filter(Form.id == form_id, Form.creator_id == creator_id).first()
    if not form:
        raise AppError("FORM_NOT_FOUND", "Form not found", 404)
    return form


def list_forms(db: Session, creator_id: str, q: str = None, status: str = None):
    query = db.query(Form).filter(Form.creator_id == creator_id)

    if status in ["draft", "published"]:
        query = query.filter(Form.status == status)

    if q:
        escaped_q = q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        query = query.filter(Form.title.ilike(f"%{escaped_q}%", escape="\\"))

    query = query.order_by(Form.updated_at.desc())
    forms = query.all()

    form_ids = [f.id for f in forms]
    if not form_ids:
        return {"items": [], "total": 0}

    question_counts = dict(
        db.query(Question.form_id, func.count(Question.id))
        .filter(Question.form_id.in_(form_ids))
        .group_by(Question.form_id)
        .all()
    )

    response_counts = dict(
        db.query(Submission.form_id, func.count(Submission.id))
        .filter(Submission.form_id.in_(form_ids), Submission.status == "completed")
        .group_by(Submission.form_id)
        .all()
    )

    items = []
    for f in forms:
        items.append(
            {
                "id": str(f.id),
                "title": f.title,
                "status": f.status,
                "slug": f.slug,
                "updated_at": f.updated_at,
                "published_at": f.published_at,
                "question_count": question_counts.get(f.id, 0),
                "response_count": response_counts.get(f.id, 0),
            }
        )

    return {"items": items, "total": len(items)}


def create_form(db: Session, creator_id: str, data: FormCreate) -> Form:
    slug = generate_unique_form_slug(db)
    form = Form(creator_id=creator_id, title=data.title, slug=slug)
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


def get_form(db: Session, creator_id: str, form_id: str) -> Form:
    return _get_form_or_404(db, creator_id, form_id)


def update_form(db: Session, creator_id: str, form_id: str, data: FormUpdate) -> Form:
    form = _get_form_or_404(db, creator_id, form_id)

    update_data = data.model_dump(exclude_unset=True)
    if update_data:
        for k, v in update_data.items():
            setattr(form, k, v)
        db.commit()
        db.refresh(form)
    return form


def delete_form(db: Session, creator_id: str, form_id: str):
    form = _get_form_or_404(db, creator_id, form_id)
    db.delete(form)
    db.commit()


def duplicate_form(db: Session, creator_id: str, form_id: str) -> Form:
    original = _get_form_or_404(db, creator_id, form_id)

    new_form = Form(
        creator_id=creator_id,
        title=f"Copy of {original.title}",
        description=original.description,
        status="draft",
        slug=generate_unique_form_slug(db),
        thank_you_title=original.thank_you_title,
        thank_you_message=original.thank_you_message,
        theme=original.theme,
    )
    db.add(new_form)
    db.flush()

    for q in original.questions:
        new_q = Question(
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            position=q.position,
            config=q.config,
        )
        db.add(new_q)
        db.flush()

        for opt in q.options:
            new_opt = QuestionOption(question_id=new_q.id, label=opt.label, position=opt.position)
            db.add(new_opt)

    db.commit()
    db.refresh(new_form)
    return new_form


import datetime


def publish_form(db: Session, creator_id: str, form_id: str) -> Form:
    form = _get_form_or_404(db, creator_id, form_id)

    errors = []

    if not form.questions:
        errors.append(
            {
                "question_id": "form",
                "code": "NO_QUESTIONS",
                "message": "Form must have at least one question",
            }
        )

    for q in form.questions:
        if not q.title or not q.title.strip():
            errors.append(
                {
                    "question_id": str(q.id),
                    "code": "EMPTY_TITLE",
                    "message": "Question title cannot be empty",
                }
            )

        if q.type in ["multiple_choice", "dropdown"]:
            has_valid_option = False
            for opt in q.options:
                if opt.label and opt.label.strip():
                    has_valid_option = True
                    break
            if not has_valid_option:
                errors.append(
                    {
                        "question_id": str(q.id),
                        "code": "NO_OPTIONS",
                        "message": "Choice questions must have at least one valid option",
                    }
                )

    if errors:
        raise AppError(
            code="PUBLISH_VALIDATION_FAILED",
            message="Form validation failed",
            status_code=422,
            fields=errors,
        )

    form.status = "published"
    if not form.published_at:
        form.published_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(form)
    return form


def unpublish_form(db: Session, creator_id: str, form_id: str) -> Form:
    form = _get_form_or_404(db, creator_id, form_id)
    form.status = "draft"
    db.commit()
    db.refresh(form)
    return form
