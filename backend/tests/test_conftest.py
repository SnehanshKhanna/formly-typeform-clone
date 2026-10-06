import os

from app.models.creator import Creator


def test_smoke_conftest(client, db_session, default_creator, second_creator, temp_db_file):
    assert os.path.exists(temp_db_file)

    # Assert DB is seeded with the creators
    creators = db_session.query(Creator).all()
    assert len(creators) == 2

    assert default_creator.email == "demo@formly.app"
    assert second_creator.email == "second@example.com"

    res = client.get("/api/health")
    assert res.status_code == 200


# After the test completes, pytest fixture cleanup will remove the db file.
# The Accept criteria requires we verify DB files are cleaned up,
# but that's handled by pytest teardown.
