import datetime
import os
import random
import sys

# Add the project root to the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.creator import Creator
from app.models.form import Form
from app.schemas.question import QuestionCreate
from app.schemas.submission import AnswerCreate, SubmissionCreate
from app.services import public_service, question_service


def run_seed(db):
    random.seed(42)

    # Create a creator if not exists
    creator = db.query(Creator).filter(Creator.email == "demo@example.com").first()
    if not creator:
        creator = Creator(email="demo@example.com", name="Demo User")
        db.add(creator)
        db.commit()
        db.refresh(creator)

    # Fixed slugs
    slugs = ["demo-form-1", "demo-form-2", "demo-draft"]

    # Check idempotency
    existing = db.query(Form).filter(Form.slug.in_(slugs)).count()
    if existing == 3:
        return

    # Delete existing if partial (for true idempotency)
    db.query(Form).filter(Form.slug.in_(slugs)).delete()
    db.commit()

    # --- Form 1 (28 submissions) ---
    form1 = Form(
        creator_id=creator.id,
        title="Customer Satisfaction Survey",
        description="Please let us know how we did.",
        slug="demo-form-1",
        status="published",
        published_at=datetime.datetime.now(datetime.timezone.utc),
    )
    db.add(form1)
    db.commit()
    db.refresh(form1)

    # Create questions for form 1
    # short_text, multiple_choice, rating, long_text, email
    q1 = question_service.create_question(
        db,
        str(creator.id),
        str(form1.id),
        QuestionCreate(type="short_text", title="What is your name?"),
    )
    q2 = question_service.create_question(
        db,
        str(creator.id),
        str(form1.id),
        QuestionCreate(
            type="multiple_choice",
            title="How did you hear about us?",
            options=[{"label": "Search Engine"}, {"label": "Social Media"}, {"label": "Friend"}],
        ),
    )
    q3 = question_service.create_question(
        db,
        str(creator.id),
        str(form1.id),
        QuestionCreate(type="rating", title="Rate our service", config={"max": 5}),
    )
    q4 = question_service.create_question(
        db,
        str(creator.id),
        str(form1.id),
        QuestionCreate(type="long_text", title="Any additional feedback?"),
    )
    q5 = question_service.create_question(
        db,
        str(creator.id),
        str(form1.id),
        QuestionCreate(type="email", title="What is your email?"),
    )

    # Submissions for form 1 (28)
    for i in range(28):
        ans = [
            AnswerCreate(question_id=str(q1.id), value=f"User {i}"),
            AnswerCreate(question_id=str(q2.id), value=[random.choice(q2.options).id]),
            AnswerCreate(question_id=str(q3.id), value=random.randint(1, 5)),
            AnswerCreate(question_id=str(q4.id), value="Great service!"),
            AnswerCreate(question_id=str(q5.id), value=f"user{i}@example.com"),
        ]
        public_service.submit_form(db, "demo-form-1", SubmissionCreate(answers=ans))

    # --- Form 2 (18 submissions) ---
    form2 = Form(
        creator_id=creator.id,
        title="Event RSVP",
        slug="demo-form-2",
        status="published",
        published_at=datetime.datetime.now(datetime.timezone.utc),
    )
    db.add(form2)
    db.commit()
    db.refresh(form2)

    # dropdown, yes_no, number
    q6 = question_service.create_question(
        db,
        str(creator.id),
        str(form2.id),
        QuestionCreate(
            type="dropdown",
            title="Will you attend?",
            options=[{"label": "Yes"}, {"label": "No"}, {"label": "Maybe"}],
        ),
    )
    q7 = question_service.create_question(
        db,
        str(creator.id),
        str(form2.id),
        QuestionCreate(type="yes_no", title="Bringing a plus one?"),
    )
    q8 = question_service.create_question(
        db,
        str(creator.id),
        str(form2.id),
        QuestionCreate(type="number", title="How many people total?"),
    )

    for i in range(18):
        ans = [
            AnswerCreate(question_id=str(q6.id), value=[random.choice(q6.options).id]),
            AnswerCreate(question_id=str(q7.id), value=random.choice([True, False])),
            AnswerCreate(question_id=str(q8.id), value=random.randint(1, 5)),
        ]
        public_service.submit_form(db, "demo-form-2", SubmissionCreate(answers=ans))

    # --- Form 3 (Draft, 0 submissions) ---
    form3 = Form(creator_id=creator.id, title="Upcoming product", slug="demo-draft", status="draft")
    db.add(form3)
    db.commit()
    db.refresh(form3)

    question_service.create_question(
        db,
        str(creator.id),
        str(form3.id),
        QuestionCreate(type="short_text", title="What feature do you want?"),
    )

    print("Seeded successfully.")


if __name__ == "__main__":
    db = SessionLocal()
    run_seed(db)
