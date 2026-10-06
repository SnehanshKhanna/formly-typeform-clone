from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.answer import Answer
from app.models.form import Form
from app.models.submission import Submission
from app.question_types.registry import get_handler


def get_form_stats(db: Session, form_id: str):
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise AppError("NOT_FOUND", "Form not found", 404)

    subs = db.query(Submission).filter(Submission.form_id == form.id).all()
    sub_count = len(subs)

    question_stats = {}

    for q in form.questions:
        answers = db.query(Answer).filter(Answer.question_id == str(q.id)).all()
        handler = get_handler(q.type)
        stats = handler.calculate_stats(q, answers)

        stats["skipped"] = sub_count - len(answers)
        question_stats[str(q.id)] = stats

    return {"total_submissions": sub_count, "question_stats": question_stats}
