import logging
from typing import Any, Dict, List, Optional

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

logger = logging.getLogger(__name__)


class AppError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        fields: Optional[List[Dict[str, Any]]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.fields = fields


async def app_error_handler(request: Request, exc: AppError):
    response = {"error": {"code": exc.code, "message": exc.message}}
    if exc.fields:
        response["error"]["fields"] = exc.fields
    return JSONResponse(status_code=exc.status_code, content=response)


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Check if path parameter error to return 404
    is_path_param_error = any(
        isinstance(e.get("loc"), tuple) and len(e["loc"]) > 0 and e["loc"][0] == "path"
        for e in exc.errors()
    )
    if is_path_param_error:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": {"code": "NOT_FOUND", "message": "Resource not found"}},
        )

    fields = []
    for err in exc.errors():
        field_loc = err.get("loc", [])
        field_name = str(field_loc[-1]) if field_loc else "unknown"
        fields.append({"field": field_name, "code": "VALIDATION_FAILED", "message": err.get("msg")})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request parameters",
                "fields": fields,
            }
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    code = "NOT_FOUND" if exc.status_code == 404 else f"HTTP_{exc.status_code}"
    return JSONResponse(
        status_code=exc.status_code, content={"error": {"code": code, "message": str(exc.detail)}}
    )


async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred"}},
    )
