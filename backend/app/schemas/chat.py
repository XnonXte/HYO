"""Pydantic schemas for chat and health endpoints."""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class RoleEnum(str, Enum):
    """Supported roles in conversation history."""

    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(BaseModel):
    """Single message in conversation history."""

    role: RoleEnum = Field(
        ...,
        description="Role of the speaker: 'user' or 'assistant'",
        examples=["user", "assistant"],
    )
    content: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="Content of the message (1-4000 characters)",
        examples=["I had a difficult day at work."],
    )

    @field_validator("content")
    @classmethod
    def validate_content_not_empty(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Message content cannot be empty or only whitespace.")
        return trimmed


class ChatRequest(BaseModel):
    """Incoming request payload for /api/chat."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The user's message to HYO (1-4000 characters)",
        examples=["I've been feeling overwhelmed lately."],
    )
    history: List[ChatMessage] = Field(
        default_factory=list,
        max_length=50,
        description="Chronological conversation history between user and assistant",
    )

    @field_validator("message")
    @classmethod
    def validate_message_not_empty(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Message cannot be empty or contain only whitespace.")
        return trimmed


class ChatResponse(BaseModel):
    """Response payload for /api/chat."""

    reply: str = Field(
        ...,
        description="HYO's empathetic response",
        examples=["I'm sorry things have been overwhelming. Would you like to tell me what's been happening?"],
    )


class HealthResponse(BaseModel):
    """Response payload for /api/health."""

    status: str = Field(
        default="ok",
        description="Operational status of the backend service",
        examples=["ok"],
    )
    service: str = Field(
        default="HYO Backend",
        description="Service identifier",
        examples=["HYO Backend"],
    )


class ErrorDetail(BaseModel):
    """Standard error response detail."""

    detail: str = Field(
        ...,
        description="User-friendly error explanation",
    )
    code: Optional[str] = Field(
        default=None,
        description="Internal error code identifier",
    )
