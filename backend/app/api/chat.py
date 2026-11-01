"""API routes for health check and chat interactions."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.chat import ChatRequest, ChatResponse, HealthResponse
from app.services.gemini_service import (
    GeminiQuotaError,
    GeminiResponseValidationError,
    GeminiService,
    GeminiServiceError,
    GeminiTimeoutError,
    GeminiUnavailableError,
    get_gemini_service,
)
from app.services.safety_service import (
    BaseSafetyService,
    get_safety_service,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Chat & Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check whether the HYO backend service is operational.",
)
async def health_check() -> HealthResponse:
    """Return backend operational status."""
    return HealthResponse(
        status="ok",
        service="HYO Backend",
    )


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Send message to HYO",
    description=(
        "Send a message and optional conversation history to HYO. "
        "Returns an empathetic, supportive response. "
        "Stateless: previous conversation turns must be provided in the history array."
    ),
    responses={
        200: {"description": "Successful conversational response"},
        422: {"description": "Malformed request or validation error"},
        429: {"description": "Gemini API quota or rate limit exceeded"},
        502: {"description": "Upstream AI provider error or invalid response"},
        503: {"description": "AI provider service unavailable"},
        504: {"description": "Request to AI provider timed out"},
    },
)
async def chat_with_hyo(
    request: ChatRequest,
    gemini_service: Annotated[GeminiService, Depends(get_gemini_service)],
    safety_service: Annotated[BaseSafetyService, Depends(get_safety_service)],
) -> ChatResponse:
    """Process incoming chat message with safety screening and Gemini generation."""
    # 1. Defense-in-depth crisis safety screening
    assessment = await safety_service.assess(
        message=request.message,
        history=request.history,
    )

    if assessment.is_crisis and assessment.crisis_response:
        logger.info("Crisis response protocol served to client safely.")
        return ChatResponse(reply=assessment.crisis_response)

    # 2. Asynchronous generation via Gemini
    try:
        reply = await gemini_service.generate_reply(
            message=request.message,
            history=request.history,
        )
        return ChatResponse(reply=reply)

    except GeminiQuotaError:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI companion is currently experiencing high demand. Please try again in a few moments.",
        )
    except GeminiTimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="AI companion took too long to respond. Please try again.",
        )
    except GeminiUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable. Please try again shortly.",
        )
    except GeminiResponseValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=exc.message,
        )
    except GeminiServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI companion service encountered an upstream issue. Please try again.",
        )
    except Exception as exc:
        logger.error("Unhandled error processing chat: %s", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected internal error occurred. Please try again later.",
        )
