"""Comprehensive automated test suite for HYO FastAPI backend.

All Gemini API calls are mocked: tests never consume real API quota or require live credentials.
"""

from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from google.genai import errors

from app.api.chat import get_gemini_service, get_safety_service
from app.core.config import Settings
from app.main import app
from app.schemas.chat import ChatMessage, RoleEnum
from app.services.gemini_service import (
    GeminiQuotaError,
    GeminiResponseValidationError,
    GeminiService,
    GeminiServiceError,
    GeminiTimeoutError,
    GeminiUnavailableError,
)
from app.services.safety_service import (
    CrisisSafetyService,
    RiskLevel,
    SafetyAssessment,
)


@pytest.fixture
def client():
    """FastAPI TestClient fixture with cleared dependency overrides after each test."""
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def mock_gemini():
    """Mock GeminiService fixture."""
    mock = MagicMock(spec=GeminiService)
    mock.generate_reply = AsyncMock(
        return_value="I hear how challenging things have been for you. Would you like to share more?"
    )
    return mock


# ==============================================================================
# 1. Health Check Endpoint Tests
# ==============================================================================

def test_health_check_endpoint(client: TestClient):
    """GET /api/health must return 200 and expected status object."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "HYO Backend"


def test_root_endpoint(client: TestClient):
    """GET / must return basic service metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["health"] == "/api/health"


# ==============================================================================
# 2. Valid Chat Request Tests
# ==============================================================================

def test_valid_chat_request_without_history(client: TestClient, mock_gemini: MagicMock):
    """POST /api/chat with valid message and no history should return 200 and reply."""
    app.dependency_overrides[get_gemini_service] = lambda: mock_gemini

    payload = {"message": "I've been feeling overwhelmed lately."}
    response = client.post("/api/chat", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["reply"] == "I hear how challenging things have been for you. Would you like to share more?"
    mock_gemini.generate_reply.assert_awaited_once_with(
        message="I've been feeling overwhelmed lately.",
        history=[],
    )


def test_valid_chat_request_with_history(client: TestClient, mock_gemini: MagicMock):
    """POST /api/chat with valid message and conversation history."""
    app.dependency_overrides[get_gemini_service] = lambda: mock_gemini

    payload = {
        "message": "I feel like I have too many deadlines.",
        "history": [
            {"role": "user", "content": "I had a difficult day."},
            {"role": "assistant", "content": "Would you like to talk about it?"},
        ],
    }
    response = client.post("/api/chat", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert mock_gemini.generate_reply.await_count == 1
    call_args = mock_gemini.generate_reply.await_args
    assert call_args.kwargs["message"] == "I feel like I have too many deadlines."
    history_passed = call_args.kwargs["history"]
    assert len(history_passed) == 2
    assert history_passed[0].role == RoleEnum.USER
    assert history_passed[0].content == "I had a difficult day."
    assert history_passed[1].role == RoleEnum.ASSISTANT
    assert history_passed[1].content == "Would you like to talk about it?"


# ==============================================================================
# 3. Input Validation Tests (Empty, Whitespace, Length, Missing Fields)
# ==============================================================================

def test_empty_message_validation(client: TestClient):
    """POST /api/chat with empty string must fail with 422."""
    payload = {"message": ""}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422
    errors_list = response.json().get("detail", [])
    assert any("message" in str(err) for err in errors_list)


def test_whitespace_only_message_validation(client: TestClient):
    """POST /api/chat with whitespace-only string must fail with 422."""
    payload = {"message": "   \n\t  "}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422


def test_excessively_long_message_validation(client: TestClient):
    """POST /api/chat with message > 4000 characters must fail with 422."""
    long_message = "A" * 4001
    payload = {"message": long_message}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422


def test_missing_message_field(client: TestClient):
    """POST /api/chat with missing 'message' field must fail with 422."""
    payload = {"history": []}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422


def test_invalid_conversation_role(client: TestClient):
    """POST /api/chat with invalid role (e.g. 'system' or 'admin') must fail with 422."""
    payload = {
        "message": "Hello",
        "history": [
            {"role": "system", "content": "You are a therapist."},
        ],
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422


def test_history_message_empty_content(client: TestClient):
    """POST /api/chat where a history item has empty content must fail with 422."""
    payload = {
        "message": "Hello",
        "history": [
            {"role": "user", "content": "   "},
        ],
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422


# ==============================================================================
# 4. Gemini API Error Handling Tests
# ==============================================================================

def test_gemini_quota_error(client: TestClient, mock_gemini: MagicMock):
    """When Gemini throws QuotaError, endpoint should return HTTP 429."""
    mock_gemini.generate_reply = AsyncMock(side_effect=GeminiQuotaError())
    app.dependency_overrides[get_gemini_service] = lambda: mock_gemini

    response = client.post("/api/chat", json={"message": "Hello"})
    assert response.status_code == 429
    assert "quota" in response.json()["detail"].lower() or "demand" in response.json()["detail"].lower()


def test_gemini_timeout_error(client: TestClient, mock_gemini: MagicMock):
    """When Gemini times out, endpoint should return HTTP 504."""
    mock_gemini.generate_reply = AsyncMock(side_effect=GeminiTimeoutError())
    app.dependency_overrides[get_gemini_service] = lambda: mock_gemini

    response = client.post("/api/chat", json={"message": "Hello"})
    assert response.status_code == 504
    assert "timed out" in response.json()["detail"].lower() or "long" in response.json()["detail"].lower()


def test_gemini_service_unavailable(client: TestClient, mock_gemini: MagicMock):
    """When Gemini is unavailable (503), endpoint should return HTTP 503."""
    mock_gemini.generate_reply = AsyncMock(side_effect=GeminiUnavailableError())
    app.dependency_overrides[get_gemini_service] = lambda: mock_gemini

    response = client.post("/api/chat", json={"message": "Hello"})
    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"].lower()


def test_gemini_empty_response_handling(client: TestClient, mock_gemini: MagicMock):
    """When Gemini returns an empty or unparseable response, endpoint returns 502."""
    mock_gemini.generate_reply = AsyncMock(
        side_effect=GeminiResponseValidationError("Empty response from LLM")
    )
    app.dependency_overrides[get_gemini_service] = lambda: mock_gemini

    response = client.post("/api/chat", json={"message": "Hello"})
    assert response.status_code == 502


def test_gemini_generic_upstream_error(client: TestClient, mock_gemini: MagicMock):
    """When Gemini returns generic upstream error, endpoint returns 502."""
    mock_gemini.generate_reply = AsyncMock(side_effect=GeminiServiceError("Upstream failure"))
    app.dependency_overrides[get_gemini_service] = lambda: mock_gemini

    response = client.post("/api/chat", json={"message": "Hello"})
    assert response.status_code == 502


# ==============================================================================
# 5. Safety Service & Crisis Protocol Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_safety_service_clean_message():
    """Benign messages should not trigger crisis protocol."""
    service = CrisisSafetyService()
    assessment = await service.assess("I had a stressful day at college.")
    assert assessment.is_crisis is False
    assert assessment.risk_level == RiskLevel.NONE
    assert assessment.crisis_response is None


@pytest.mark.asyncio
async def test_safety_service_crisis_english():
    """English crisis trigger message must activate crisis protocol with hotlines."""
    service = CrisisSafetyService()
    assessment = await service.assess("I want to kill myself, everything is too much.")
    assert assessment.is_crisis is True
    assert assessment.risk_level == RiskLevel.CRITICAL
    assert assessment.requires_human_escalation is True
    assert assessment.crisis_response is not None
    assert "988" in assessment.crisis_response
    # Rule: Must not claim emergency services were contacted
    assert "dispatched" not in assessment.crisis_response.lower()
    assert "called 911" not in assessment.crisis_response.lower()


@pytest.mark.asyncio
async def test_safety_service_crisis_indonesian():
    """Indonesian crisis trigger message must activate Indonesian crisis protocol."""
    service = CrisisSafetyService()
    assessment = await service.assess("Aku capek banget dan mau bunuh diri aja.")
    assert assessment.is_crisis is True
    assert assessment.risk_level == RiskLevel.CRITICAL
    assert assessment.requires_human_escalation is True
    assert assessment.crisis_response is not None
    assert "119" in assessment.crisis_response
    assert "LISA" in assessment.crisis_response


def test_crisis_message_bypasses_gemini(client: TestClient, mock_gemini: MagicMock):
    """Acute crisis message should immediately return crisis response without calling Gemini."""
    app.dependency_overrides[get_gemini_service] = lambda: mock_gemini

    payload = {"message": "I want to kill myself right now."}
    response = client.post("/api/chat", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "988" in data["reply"]
    # Verify Gemini was never invoked
    mock_gemini.generate_reply.assert_not_called()


# ==============================================================================
# 6. Conversation History Truncation & Formatting (Unit Tests)
# ==============================================================================

def test_conversation_history_truncation_in_gemini_service():
    """GeminiService._format_conversation_contents should limit history to MAX_HISTORY_MESSAGES."""
    custom_settings = Settings(
        GEMINI_API_KEY="test_key",
        MAX_HISTORY_MESSAGES=4,
    )
    service = GeminiService(settings=custom_settings, client=MagicMock())

    # Build 8 history messages
    history = [
        ChatMessage(role=RoleEnum.USER, content=f"User turn {i}")
        if i % 2 == 0
        else ChatMessage(role=RoleEnum.ASSISTANT, content=f"Assistant turn {i}")
        for i in range(8)
    ]

    contents = service._format_conversation_contents(
        message="Latest message",
        history=history,
    )

    # 4 history messages + 1 current message = 5
    assert len(contents) == 5

    # Check chronological order preservation: last items of history should be 4, 5, 6, 7
    assert contents[0].parts[0].text == "User turn 4"
    assert contents[1].parts[0].text == "Assistant turn 5"
    assert contents[2].parts[0].text == "User turn 6"
    assert contents[3].parts[0].text == "Assistant turn 7"
    assert contents[4].parts[0].text == "Latest message"

    # Check role mapping
    assert contents[0].role == "user"
    assert contents[1].role == "model"
    assert contents[4].role == "user"


# ==============================================================================
# 7. GeminiService Exception Mapping (Unit Tests)
# ==============================================================================

@pytest.mark.asyncio
async def test_gemini_service_maps_api_error_429():
    """Verify GeminiService maps APIError with code 429 to GeminiQuotaError."""
    custom_settings = Settings(GEMINI_API_KEY="test_key")
    mock_client = MagicMock()
    mock_aio = MagicMock()
    mock_client.aio = mock_aio

    # Create dummy APIError with status 429
    api_error = errors.APIError(429, {"error": {"message": "Resource exhausted"}}, MagicMock())
    mock_aio.models.generate_content = AsyncMock(side_effect=api_error)

    service = GeminiService(settings=custom_settings, client=mock_client)

    with pytest.raises(GeminiQuotaError):
        await service.generate_reply(message="Hello")


@pytest.mark.asyncio
async def test_gemini_service_maps_api_error_503():
    """Verify GeminiService maps APIError with code 503 to GeminiUnavailableError."""
    custom_settings = Settings(GEMINI_API_KEY="test_key")
    mock_client = MagicMock()
    mock_aio = MagicMock()
    mock_client.aio = mock_aio

    api_error = errors.APIError(503, {"error": {"message": "Service unavailable"}}, MagicMock())
    mock_aio.models.generate_content = AsyncMock(side_effect=api_error)

    service = GeminiService(settings=custom_settings, client=mock_client)

    with pytest.raises(GeminiUnavailableError):
        await service.generate_reply(message="Hello")


@pytest.mark.asyncio
async def test_gemini_service_maps_empty_response():
    """Verify GeminiService raises GeminiResponseValidationError when response text is empty."""
    custom_settings = Settings(GEMINI_API_KEY="test_key")
    mock_client = MagicMock()
    mock_aio = MagicMock()
    mock_client.aio = mock_aio

    mock_resp = MagicMock()
    mock_resp.text = ""
    mock_aio.models.generate_content = AsyncMock(return_value=mock_resp)

    service = GeminiService(settings=custom_settings, client=mock_client)

    with pytest.raises(GeminiResponseValidationError):
        await service.generate_reply(message="Hello")


# ==============================================================================
# 8. CORS Configuration Tests
# ==============================================================================

def test_cors_preflight(client: TestClient):
    """CORS OPTIONS preflight request should return permitted origin."""
    response = client.options(
        "/api/chat",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
