"""FastAPI application entrypoint for HYO Mental Wellness Backend."""

import logging
from typing import Any, Dict

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.chat import router as chat_router
from app.core.config import get_settings

# Configure application logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("hyo.backend")

settings = get_settings()

app = FastAPI(
    title="HYO - Mental Wellness AI Backend",
    description=(
        "Backend API for HYO, an empathetic emotional support AI companion. "
        "Powered by FastAPI and Google Gemini API."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Register API routers under /api
app.include_router(chat_router, prefix="/api")


@app.get(
    "/",
    summary="Root Service Info",
    tags=["Root"],
)
async def root() -> Dict[str, Any]:
    """Root landing endpoint providing service identification and API documentation link."""
    return {
        "service": "HYO Mental Wellness Backend",
        "version": "1.0.0",
        "status": "operational",
        "documentation": "/docs",
        "health": "/api/health",
    }


@app.exception_handler(Exception)
async def global_unhandled_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """Safeguard against exposing raw stack traces or internal environment variables."""
    logger.error("Unhandled server exception on %s %s: %s", request.method, request.url.path, type(exc).__name__)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please try again later.",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.APP_ENV == "development",
    )
