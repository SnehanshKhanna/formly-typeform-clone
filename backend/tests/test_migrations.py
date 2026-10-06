import os
import subprocess


def test_no_autogenerate_drift():
    # Run alembic check to verify models match DB schema
    cwd = os.path.dirname(os.path.dirname(__file__))
    result = subprocess.run(
        [r".\.venv\Scripts\alembic.exe", "check"], cwd=cwd, capture_output=True, text=True
    )
    assert result.returncode == 0, f"Alembic drift detected: {result.stderr or result.stdout}"
    assert (
        "No new upgrade operations detected" in result.stdout
        or "No new upgrade operations detected" in result.stderr
    )
