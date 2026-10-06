import datetime
from typing import List

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.question import Question
from app.models.question_option import QuestionOption
from app.question_types.registry import get_handler
from app.schemas.question import QuestionCreate, QuestionOptionCreate, QuestionUpdate
from app.services import form_service


def create_question(db: Session, creator_id: str, form_id: str, data: QuestionCreate) -> Question:
    form = form_service._get_form_or_404(db, creator_id, form_id)

    if len(form.questions) >= 100:
        raise AppError("QUESTION_LIMIT", "Maximum 100 questions allowed", 422)

    try:
        handler = get_handler(data.type)
    except Exception:
        raise AppError("INVALID_TYPE", f"Unknown question type: {data.type}", 422)

    supports_options = data.type in ["multiple_choice", "dropdown"]
    if data.options and not supports_options:
        raise AppError("OPTIONS_NOT_SUPPORTED", f"Type {data.type} does not support options", 422)

    config = {}
    if data.type in ["short_text", "long_text", "email"]:
        config = {"placeholder": ""}
    elif data.type == "number":
        config = {"placeholder": "", "min": None, "max": None}
    elif data.type == "rating":
        config = {"max": 5}
    elif data.type == "multiple_choice":
        config = {"allow_multiple": False}
    elif data.type == "dropdown":
        config = {"placeholder": ""}

    if data.config:
        config.update(data.config)

    try:
        config = handler.validate_config(config)
    except Exception as e:
        raise AppError("INVALID_CONFIG", str(e), 422)

    if data.after_question_id:
        target = next((q for q in form.questions if str(q.id) == data.after_question_id), None)
        if not target:
            raise AppError("INVALID_POSITION", "after_question_id not found", 422)
        position = target.position + 1
        for q in form.questions:
            if q.position >= position:
                q.position += 1
    else:
        position = len(form.questions)

    question = Question(
        form_id=form.id,
        type=data.type,
        title=data.title or "",
        description=data.description,
        required=data.required,
        position=position,
        config=config,
    )
    db.add(question)
    db.flush()

    if supports_options:
        options = data.options
        if options is None:
            options = [
                QuestionOptionCreate(label="Choice 1"),
                QuestionOptionCreate(label="Choice 2"),
            ]
        for idx, opt in enumerate(options):
            new_opt = QuestionOption(question_id=question.id, label=opt.label, position=idx)
            db.add(new_opt)

    form.updated_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(question)
    return question


def update_question(
    db: Session, creator_id: str, form_id: str, qid: str, data: QuestionUpdate
) -> Question:
    form = form_service._get_form_or_404(db, creator_id, form_id)
    question = next((q for q in form.questions if str(q.id) == qid), None)
    if not question:
        raise AppError("QUESTION_NOT_FOUND", "Question not found", 404)

    if getattr(data, "type", None) is not None:
        if data.type != question.type:
            raise AppError("QUESTION_TYPE_IMMUTABLE", "Cannot change question type", 422)

    if data.title is not None:
        question.title = data.title
    if data.description is not None:
        question.description = data.description
    if data.required is not None:
        question.required = data.required

    if data.config is not None:
        try:
            handler = get_handler(question.type)
            config = handler.validate_config(data.config)
            question.config = config
        except Exception as e:
            raise AppError("INVALID_CONFIG", str(e), 422)

    if data.options is not None:
        supports_options = question.type in ["multiple_choice", "dropdown"]
        if not supports_options:
            raise AppError("OPTIONS_NOT_SUPPORTED", "This type doesn't support options", 422)

        existing_options = {str(opt.id): opt for opt in question.options}
        new_option_ids = set()

        for idx, opt_data in enumerate(data.options):
            if opt_data.id:
                if opt_data.id not in existing_options:
                    raise AppError("INVALID_OPTION_ID", f"Option {opt_data.id} not found", 422)
                opt = existing_options[opt_data.id]
                opt.label = opt_data.label
                opt.position = idx
                new_option_ids.add(opt_data.id)
            else:
                new_opt = QuestionOption(
                    question_id=question.id, label=opt_data.label, position=idx
                )
                db.add(new_opt)

        for opt_id, opt in existing_options.items():
            if opt_id not in new_option_ids:
                db.delete(opt)

    form.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(question)
    return question


def reorder_questions(
    db: Session, creator_id: str, form_id: str, ordered_ids: List[str]
) -> List[Question]:
    form = form_service._get_form_or_404(db, creator_id, form_id)

    current_ids = {str(q.id) for q in form.questions}
    provided_ids = set(ordered_ids)

    if len(ordered_ids) != len(provided_ids) or provided_ids != current_ids:
        raise AppError("REORDER_MISMATCH", "Provided ids do not exactly match form questions", 422)

    id_to_q = {str(q.id): q for q in form.questions}

    for idx, q_id in enumerate(ordered_ids):
        q = id_to_q[q_id]
        q.position = idx

    form.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()

    return sorted(form.questions, key=lambda x: x.position)


def delete_question(db: Session, creator_id: str, form_id: str, qid: str):
    form = form_service._get_form_or_404(db, creator_id, form_id)
    question = next((q for q in form.questions if str(q.id) == qid), None)
    if not question:
        raise AppError("QUESTION_NOT_FOUND", "Question not found", 404)

    deleted_position = question.position
    db.delete(question)

    for q in form.questions:
        if q.position > deleted_position:
            q.position -= 1

    form.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()


def duplicate_question(db: Session, creator_id: str, form_id: str, qid: str) -> Question:
    form = form_service._get_form_or_404(db, creator_id, form_id)

    if len(form.questions) >= 100:
        raise AppError("QUESTION_LIMIT", "Maximum 100 questions allowed", 422)

    original = next((q for q in form.questions if str(q.id) == qid), None)
    if not original:
        raise AppError("QUESTION_NOT_FOUND", "Question not found", 404)

    position = original.position + 1
    for q in form.questions:
        if q.position >= position:
            q.position += 1

    new_q = Question(
        form_id=form.id,
        type=original.type,
        title=original.title,
        description=original.description,
        required=original.required,
        position=position,
        config=original.config,
    )
    db.add(new_q)
    db.flush()

    for opt in original.options:
        new_opt = QuestionOption(question_id=new_q.id, label=opt.label, position=opt.position)
        db.add(new_opt)

    form.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(new_q)
    return new_q
