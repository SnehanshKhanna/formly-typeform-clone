from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.errors import (
    AppError,
    app_error_handler,
    global_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.core.middleware import PayloadLimitMiddleware
from app.routers import health


def create_app() -> FastAPI:
    app = FastAPI(
        title="Formly API",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
        redirect_slashes=False,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_origin_regex=settings.CORS_ORIGIN_REGEX,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["*"],
    )

    app.add_middleware(PayloadLimitMiddleware)

    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)

    app.include_router(health.router)
    from app.routers import forms, public, questions

    @app.get("/")
    @app.get("/api")
    async def root():
        return {"status": "ok", "message": "Formly API is running"}

    app.include_router(forms.router, prefix="/api")
    app.include_router(questions.router, prefix="/api")
    app.include_router(public.router, prefix="/api")

    return app


app = create_app()
