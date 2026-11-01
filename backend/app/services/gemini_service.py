"""Gemini AI integration service using the official google-genai SDK."""

import asyncio
import logging
from typing import List, Optional

from google import genai
from google.genai import errors, types

from app.core.config import Settings, get_settings
from app.prompts.system_prompt import HYO_SYSTEM_PROMPT
from app.schemas.chat import ChatMessage, RoleEnum

logger = logging.getLogger(__name__)


# Domain Exceptions
class GeminiServiceError(Exception):
    """Base exception for Gemini service errors."""

    def __init__(self, message: str = "AI service encountered an unexpected error."):
        super().__init__(message)
        self.message = message


class GeminiQuotaError(GeminiServiceError):
    """Raised when Gemini API quota or rate limit is exceeded (HTTP 429)."""

    def __init__(self, message: str = "AI service quota exceeded. Please try again in a moment."):
        super().__init__(message)


class GeminiTimeoutError(GeminiServiceError):
    """Raised when Gemini API request times out."""

    def __init__(self, message: str = "AI service timed out while processing your message."):
        super().__init__(message)


class GeminiUnavailableError(GeminiServiceError):
    """Raised when Gemini service is unavailable (HTTP 503)."""

    def __init__(self, message: str = "AI service is temporarily unavailable. Please try again shortly."):
        super().__init__(message)


class GeminiResponseValidationError(GeminiServiceError):
    """Raised when Gemini returns an empty or invalid response."""

    def __init__(self, message: str = "AI service returned an empty or unparseable response."):
        super().__init__(message)


class GeminiService:
    """Service to interact with Google Gemini API asynchronously using google-genai SDK."""

    def __init__(self, settings: Optional[Settings] = None, client: Optional[genai.Client] = None):
        self.settings = settings or get_settings()
        self._client = client

    @property
    def client(self) -> genai.Client:
        """Lazy initialization of genai.Client."""
        if self._client is None:
            if not self.settings.GEMINI_API_KEY:
                raise GeminiServiceError(
                    "GEMINI_API_KEY is not configured in environment variables."
                )
            self._client = genai.Client(api_key=self.settings.GEMINI_API_KEY)
        return self._client

    def _format_conversation_contents(
        self,
        message: str,
        history: List[ChatMessage],
    ) -> List[types.Content]:
        """Convert conversation history and current message into Gemini Content objects.

        - Respects MAX_HISTORY_MESSAGES limit.
        - Preserves chronological order of the most recent messages.
        - Maps 'assistant' role to Gemini's expected 'model' role.
        """
        contents: List[types.Content] = []

        # Slice history to most recent N messages if history exceeds limit
        recent_history = history[-self.settings.MAX_HISTORY_MESSAGES :] if history else []

        for item in recent_history:
            gemini_role = "model" if item.role == RoleEnum.ASSISTANT else "user"
            contents.append(
                types.Content(
                    role=gemini_role,
                    parts=[types.Part.from_text(text=item.content)],
                )
            )

        # Append current user message
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=message)],
            )
        )

        return contents

    async def generate_reply(
        self,
        message: str,
        history: Optional[List[ChatMessage]] = None,
    ) -> str:
        """Generate empathetic AI response from HYO.

        Stateless: conversational context is provided entirely via the history parameter.
        Never logs message content to protect user confidentiality.
        """
        history_list = history or []
        contents = self._format_conversation_contents(message, history_list)

        config = types.GenerateContentConfig(
            system_instruction=HYO_SYSTEM_PROMPT,
            temperature=0.7,
            thinking_config=types.ThinkingConfig(
                thinking_budget=self.settings.GEMINI_THINKING_BUDGET
            ),
        )

        try:
            # Wrap asynchronous Gemini call with application-level timeout
            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=self.settings.GEMINI_MODEL,
                    contents=contents,
                    config=config,
                ),
                timeout=self.settings.REQUEST_TIMEOUT_SECONDS,
            )

        except asyncio.TimeoutError:
            logger.error("Gemini API request timed out after %s seconds", self.settings.REQUEST_TIMEOUT_SECONDS)
            raise GeminiTimeoutError()

        except errors.APIError as exc:
            # Safe error logging: log status code only, never credentials or headers
            status_code = getattr(exc, "code", None)
            logger.error("Gemini APIError encountered with status code: %s", status_code)

            if status_code == 429:
                raise GeminiQuotaError()
            elif status_code == 503:
                raise GeminiUnavailableError()
            elif status_code in (408, 504):
                raise GeminiTimeoutError()
            else:
                raise GeminiServiceError(f"AI provider returned error status {status_code}.")

        except Exception as exc:
            # Catch other unexpected exceptions without exposing internal details
            logger.error("Unexpected error in Gemini service: %s", type(exc).__name__)
            raise GeminiServiceError("An unexpected error occurred while communicating with the AI service.")

        # Validate response content
        if not response or not response.text:
            logger.warning("Gemini returned empty or filtered response text")
            raise GeminiResponseValidationError("AI companion was unable to generate a response. Please try again.")

        reply_text = response.text.strip()
        if not reply_text:
            raise GeminiResponseValidationError("AI companion returned an empty response.")

        return reply_text


def get_gemini_service() -> GeminiService:
    """Dependency provider for GeminiService."""
    return GeminiService()
