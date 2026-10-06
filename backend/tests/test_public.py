import datetime

from app.models.form import Form
from app.models.question import Question


def test_public_form(client, default_creator, db_session):
    # Create draft form
    form = Form(creator_id=default_creator.id, title="Test", status="draft", slug="test-slug")
    db_session.add(form)
    db_session.commit()

    q1 = Question(form_id=form.id, type="short_text", title="Q1", position=0)
    db_session.add(q1)
    db_session.commit()

    # Draft -> 404
    res_draft = client.get("/api/public/forms/test-slug")
    assert res_draft.status_code == 404

    # Unknown -> 404
    res_unknown = client.get("/api/public/forms/unknown-slug")
    assert res_unknown.status_code == 404

    # Identical 404 bodies
    assert res_draft.json() == res_unknown.json()

    # Publish
    form.status = "published"
    form.published_at = datetime.datetime.now(datetime.timezone.utc)
    db_session.commit()

    # Published -> 200
    res_pub = client.get("/api/public/forms/test-slug")
    assert res_pub.status_code == 200
    assert "Cache-Control" in res_pub.headers
    assert res_pub.headers["Cache-Control"] == "no-store"

    data = res_pub.json()
    assert data["id"] == str(form.id)
    assert data["title"] == "Test"
    assert "creator_id" not in data  # no creator-only fields
    assert "views" not in data
    assert len(data["questions"]) == 1

    # Unpublish -> immediate 404
    form.status = "draft"
    db_session.commit()

    res_unpub = client.get("/api/public/forms/test-slug")
    assert res_unpub.status_code == 404
    assert res_unpub.json() == res_unknown.json()
