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
    
    completed_subs = [s for s in subs if s.status == "completed"]
    completed_count = len(completed_subs)
    
    completion_rate = completed_count / sub_count if sub_count > 0 else 0
    
    times = []
    for s in completed_subs:
        if s.submitted_at and s.started_at:
            times.append((s.submitted_at - s.started_at).total_seconds())
    
    average_time_seconds = sum(times) / len(times) if times else 0

    question_stats = {}

    for q in form.questions:
        answers = db.query(Answer).filter(Answer.question_id == str(q.id)).all()
        handler = get_handler(q.type)
        stats = handler.calculate_stats(q, answers)

        stats["skipped"] = completed_count - len(answers)
        question_stats[str(q.id)] = stats

    return {
        "total_submissions": completed_count,
        "completion_rate": completion_rate,
        "average_time_seconds": average_time_seconds,
        "question_stats": question_stats
    }
