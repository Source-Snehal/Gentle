# /api/app/main.py
import logging
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import get_settings
from app.routers import public, secure

logger = logging.getLogger(__name__)

try:
    import posthog

    POSTHOG_AVAILABLE = True
except ImportError:
    POSTHOG_AVAILABLE = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Gentle API...")
    yield
    logger.info("Shutting down Gentle API...")



def create_app() -> FastAPI:
    settings = get_settings()

    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            environment=settings.app_env,
            traces_sample_rate=0.1,
        )

    if settings.posthog_key and POSTHOG_AVAILABLE:
        posthog.project_api_key = settings.posthog_key
        posthog.host = "https://app.posthog.com"

    app = FastAPI(
        title="Gentle API",
        description="Empathetic productivity companion backend",
        version="0.1.0",
        lifespan=lifespan,
    )

    # ---- CORS: must be before any other middleware/routers ----
    resolved_origins = settings.allowed_origins()
    logger.info("CORS allow_origins resolved: %s", resolved_origins or "[none]")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved_origins,  # e.g. ["http://localhost:3000", "https://your-preview.vercel.app"]
        allow_credentials=False,  # using Bearer tokens, not cookies
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
        expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
        max_age=86400,
    )

    # Catch-all OPTIONS to satisfy preflight for any path
    @app.options("/{full_path:path}")
    async def options_catch_all(full_path: str) -> Response:  # noqa: F401
        return Response(status_code=204)

    # ---- Routers ----
    app.include_router(public.router, tags=["public"])
    app.include_router(secure.router, prefix="/v1", tags=["secure"])

    @app.get("/healthz")
    async def health_check():
        return {"ok": True}

    return app


app = create_app()

# Run locally with: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
