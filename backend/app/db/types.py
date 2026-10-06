from datetime import timezone

import sqlalchemy.types as types


class UTCDateTime(types.TypeDecorator):
    """
    Ensure datetimes are stored as naive UTC in SQLite and returned as timezone-aware UTC.
    """

    impl = types.DateTime
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            if not value.tzinfo:
                # If naive, assume it's UTC and store it
                pass
            else:
                # If aware, convert to UTC and make naive
                value = value.astimezone(timezone.utc).replace(tzinfo=None)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            # Reconstruct as aware UTC
            value = value.replace(tzinfo=timezone.utc)
        return value
