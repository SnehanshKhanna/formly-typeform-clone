from sqlalchemy import text

from app.db.session import SessionLocal, engine


def test_sqlite_pragmas():
    with SessionLocal() as session:
        # Check WAL mode
        result = session.execute(text("PRAGMA journal_mode")).scalar()
        assert result.upper() == "WAL"

        # Check foreign keys
        result = session.execute(text("PRAGMA foreign_keys")).scalar()
        assert result == 1

        # Check synchronous
        result = session.execute(text("PRAGMA synchronous")).scalar()
        assert result == 1  # NORMAL is 1

        # Check busy_timeout
        result = session.execute(text("PRAGMA busy_timeout")).scalar()
        assert result == 5000


def test_foreign_keys_block_invalid_insert():
    # We will create two dummy tables to test FK
    with engine.connect() as conn:
        conn.execute(text("CREATE TABLE IF NOT EXISTS parent (id INTEGER PRIMARY KEY)"))
        conn.execute(
            text(
                "CREATE TABLE IF NOT EXISTS child "
                "(id INTEGER PRIMARY KEY, parent_id INTEGER, "
                "FOREIGN KEY(parent_id) REFERENCES parent(id))"
            )
        )
        conn.commit()

    with SessionLocal() as session:
        try:
            # Trying to insert child without parent should fail
            session.execute(text("INSERT INTO child (id, parent_id) VALUES (1, 999)"))
            session.commit()
            assert False, "Should have raised IntegrityError"
        except Exception as e:
            assert "FOREIGN KEY constraint failed" in str(e) or "foreign key" in str(e).lower()
        finally:
            session.rollback()

    with engine.connect() as conn:
        conn.execute(text("DROP TABLE child"))
        conn.execute(text("DROP TABLE parent"))
        conn.commit()
