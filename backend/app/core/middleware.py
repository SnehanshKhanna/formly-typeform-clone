from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.limits import MAX_PAYLOAD_SIZE


class PayloadLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                length = int(content_length)
                if length > MAX_PAYLOAD_SIZE:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "error": {"code": "PAYLOAD_TOO_LARGE", "message": "Payload too large"}
                        },
                    )
            except ValueError:
                pass

        return await call_next(request)
