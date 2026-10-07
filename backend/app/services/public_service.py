import datetime

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.answer import Answer
from app.models.answer_option import AnswerOption
from app.models.form import Form
from app.models.submission import Submission
from app.question_types.registry import get_handler
from app.schemas.submission import SubmissionCreate


def get_public_form(db: Session, slug: str) -> Form:
    form = db.query(Form).filter(Form.slug == slug, Form.status == "published").first()
    if not form:
        raise AppError("NOT_FOUND", "Not found", 404)
    return form


def submit_form(db: Session, slug: str, data: SubmissionCreate) -> dict:
    form = db.query(Form).filter(Form.slug == slug, Form.status == "published").first()
    if not form:
        raise AppError("NOT_FOUND", "Not found", 404)

    errors = []

    provided_qids = [str(a.question_id) for a in data.answers]
    if len(provided_qids) != len(set(provided_qids)):
        errors.append(
            {"code": "DUPLICATE_ANSWER", "message": "Duplicate answers for same question"}
        )

    form_qids = {str(q.id) for q in form.questions}
    for qid in set(provided_qids):
        if qid not in form_qids:
            errors.append(
                {"question_id": qid, "code": "UNKNOWN_QUESTION", "message": "Unknown question id"}
            )

    normalized_answers = {}

    for q in form.questions:
        ans_data = next((a for a in data.answers if str(a.question_id) == str(q.id)), None)

        if ans_data is None:
            if q.required:
                errors.append(
                    {
                        "question_id": str(q.id),
                        "code": "REQUIRED",
                        "message": "This question is required",
                    }
                )
            continue

        handler = get_handler(q.type)
        try:
            norm = handler.normalize_answer(q, ans_data.value)
            normalized_answers[str(q.id)] = norm
        except Exception as e:
            errors.append(
                {"question_id": str(q.id), "code": "VALIDATION_FAILED", "message": str(e)}
            )

    if errors:
        raise AppError(
            code="SUBMISSION_VALIDATION_FAILED",
            message="Submission validation failed",
            status_code=422,
            fields=errors,
        )

    now = datetime.datetime.now(datetime.timezone.utc)
    sub = Submission(form_id=form.id, started_at=now, submitted_at=now)
    db.add(sub)
    db.flush()

    for q_id, norm in normalized_answers.items():
        ans = Answer(
            submission_id=sub.id,
            question_id=q_id,
            value_text=norm.value_text,
            value_number=norm.value_number,
            value_bool=norm.value_boolean,
        )
        db.add(ans)
        db.flush()

        for opt_id in norm.option_ids:
            ao = AnswerOption(answer_id=ans.id, option_id=opt_id)
            db.add(ao)

    db.commit()
    return {"status": "success", "submission_id": str(sub.id)}
