"""Application configuration management using Pydantic Settings."""

from functools import lru_cache
import logging
import os
from pathlib import Path
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

# Base directory for backend (where .env resides)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables and .env file."""

    model_config = SettingsConfigDict(
        env_file=(
            str(BACKEND_DIR / ".env"),
            str(Path.cwd() / ".env"),
            ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Gemini API Configuration
    GEMINI_API_KEY: str = Field(
        default="",
        description="Google Gemini API Key obtained from Google AI Studio",
    )
    GEMINI_MODEL: str = Field(
        default="gemini-3.5-flash",
        description="Gemini Flash model identifier (e.g. gemini-3.5-flash)",
    )
    GEMINI_THINKING_BUDGET: int = Field(
        default=0,
        description="Thinking budget in tokens for Gemini models (0 disables extended thinking for fast chat)",
    )

    # Application Configuration
    APP_ENV: str = Field(
        default="development",
        description="Application environment: development, staging, or production",
    )
    APP_HOST: str = Field(
        default="127.0.0.1",
        description="Host interface for the ASGI server to bind",
    )
    APP_PORT: int = Field(
        default=8000,
        description="Port number for the ASGI server to listen on",
    )

    # CORS Configuration
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173",
        description="Comma-separated list of allowed CORS origins",
    )

    # Chat & Generation Limits
    MAX_MESSAGE_LENGTH: int = Field(
        default=4000,
        description="Maximum character length allowed for user messages",
    )
    MAX_HISTORY_MESSAGES: int = Field(
        default=20,
        description="Maximum conversation history messages sent to the LLM",
    )
    REQUEST_TIMEOUT_SECONDS: float = Field(
        default=30.0,
        description="Maximum timeout in seconds for LLM generation requests",
    )

    @field_validator("CORS_ORIGINS")
    @classmethod
    def validate_cors_origins(cls, v: str) -> str:
        if not v or not v.strip():
            return "http://localhost:5173"
        return v.strip()

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS_ORIGINS string into a list of origins.

        Ensures wildcard origins are not silently accepted in production.
        """
        origins = [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]
        if self.APP_ENV == "production" and "*" in origins:
            logger.warning(
                "Wildcard CORS origin '*' detected in production environment! "
                "Restricting to safe origins is strongly recommended."
            )
        return origins or ["http://localhost:5173"]


@lru_cache()
def get_settings() -> Settings:
    """Return a cached singleton instance of application settings."""
    return Settings()
