from datetime import datetime, timezone

from app.db.types import UTCDateTime


def test_utcdatetime_decorator():
    type_dec = UTCDateTime()

    # 1. naive in -> stored naive
    naive_dt = datetime(2025, 1, 1, 12, 0, 0)
    bound = type_dec.process_bind_param(naive_dt, None)
    assert bound.tzinfo is None

    # 2. aware in -> stored naive (UTC)
    aware_dt = datetime(2025, 1, 1, 14, 0, 0, tzinfo=timezone.utc)
    bound_aware = type_dec.process_bind_param(aware_dt, None)
    assert bound_aware.tzinfo is None
    assert bound_aware.hour == 14

    # 3. out -> aware UTC out
    result = type_dec.process_result_value(bound, None)
    assert result.tzinfo == timezone.utc
    assert result.isoformat().endswith("+00:00")
