# HYO – Mental Health AI Backend

Backend service for **HYO**, an empathetic AI-powered emotional support companion application. Built with **FastAPI**, **Google Gemini API** via the official `google-genai` Python SDK, and structured with defense-in-depth safety considerations.

---

## 1. Backend Architecture Overview

The backend is built around a modular architecture that enforces separation of concerns:

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entrypoint, CORS middleware, global exception handlers
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── chat.py          # API route handlers for /api/health and /api/chat
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py        # Pydantic Settings and environment configuration
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gemini_service.py # Official google-genai integration with timeout and error handling
│   │   └── safety_service.py # Crisis screening architecture & verified emergency helplines
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── chat.py          # Pydantic schemas for requests, responses, and validation
│   │
│   └── prompts/
│       ├── __init__.py
│       └── system_prompt.py # HYO companion persona, boundaries, and bilingual instructions
│
├── tests/
│   ├── __init__.py
│   └── test_chat.py         # Automated pytest test suite (100% mocked, zero API quota used)
│
├── .env.example             # Template for required environment variables
├── .gitignore               # Ensures credentials, virtual environments, and cache are untracked
├── pytest.ini               # Pytest configuration
├── requirements.txt         # Pinned backend dependencies
└── README.md                # Comprehensive documentation
```

### Architectural Highlights
- **Stateless Conversation Handling:** The backend maintains no persistent session database. The frontend maintains chat history and transmits it with each request.
- **Privacy First:** User message contents are never persisted to disk or logged into application logging systems.
- **Safety as a Separate Engineering Concern:** Crisis screening (`safety_service.py`) is decoupled from the LLM generation pipeline, ensuring that emergency escalation and hotlines are delivered reliably.
- **Clinical & Medical Boundaries:** HYO is strictly an emotional support companion. It does not diagnose disorders, prescribe medications, or claim clinical authority.

---

## 2. Python Environment Setup

Python **3.10+** (tested and compatible through **Python 3.14**) is required.

### Create Virtual Environment

**On Linux / macOS:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

**On Windows (PowerShell / Command Prompt):**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
```

**On Windows (Git Bash):**
```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate
```

---

## 3. Dependency Installation

Install all dependencies using `pip`:

```bash
pip install -r requirements.txt
```

Core libraries installed:
- `fastapi` & `uvicorn[standard]`: ASGI web framework and high-performance server.
- `google-genai`: Official Google Gemini Python SDK.
- `pydantic` & `pydantic-settings`: Schema validation and type-safe environment configuration.
- `python-dotenv`: Environment variable loading.
- `pytest`, `pytest-asyncio`, & `httpx`: Automated testing suite.

---

## 4. How to Obtain a Gemini API Key from Google AI Studio

1. Navigate to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click the **"Get API key"** button in the left sidebar.
4. Click **"Create API key in new project"** (or select an existing Google Cloud project).
5. Copy the generated key.
6. Keep this key confidential. Never commit your API key to Git or expose it in client-side code.

---

## 5. How to Configure `.env`

Create a local `.env` file by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` in your editor and configure the variables:

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash

# Application Configuration
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000

# CORS Configuration (comma-separated origins)
CORS_ORIGINS=http://localhost:5173
```

### Configuration Parameters

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | *(None)* | Your Google Gemini API Key from Google AI Studio. |
| `GEMINI_MODEL` | `gemini-3.5-flash` | The Gemini Flash model identifier to use. |
| `APP_ENV` | `development` | Environment mode (`development`, `staging`, `production`). |
| `APP_HOST` | `127.0.0.1` | Network interface to bind the ASGI server. |
| `APP_PORT` | `8000` | Port number for incoming HTTP connections. |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated list of permitted frontend origins. |
| `GEMINI_THINKING_BUDGET`| `0` | Thinking budget in tokens (set to `0` for low-latency conversational turns). |
| `MAX_MESSAGE_LENGTH` | `4000` | Maximum character length allowed for user messages. |
| `MAX_HISTORY_MESSAGES` | `20` | Max conversation history messages forwarded to Gemini. |
| `REQUEST_TIMEOUT_SECONDS` | `30.0` | Upstream timeout for Gemini API calls. |

---

## 6. How to Start the FastAPI Server

From inside the `backend/` directory with the virtual environment activated:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Or run via Python directly:

```bash
python -m app.main
```

Expected startup output:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

---

## 7. How to Test the API Using Swagger UI

FastAPI automatically generates interactive OpenAPI documentation:

1. Open your browser and navigate to:
   - **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
2. To test `GET /api/health`:
   - Click on `GET /api/health`
   - Click **Try it out** → **Execute**
   - Verify the `200 OK` response with `{"status": "ok", "service": "HYO Backend"}`.
3. To test `POST /api/chat`:
   - Click on `POST /api/chat`
   - Click **Try it out**
   - Enter your JSON request body in the text area
   - Click **Execute** and review the response.

---

## 8. Example `curl` Requests

### Health Check (`GET /api/health`)

```bash
curl -X GET "http://127.0.0.1:8000/api/health" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "status": "ok",
  "service": "HYO Backend"
}
```

---

### First Chat Message (`POST /api/chat`)

```bash
curl -X POST "http://127.0.0.1:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Halo HYO, hari ini aku merasa sedikit overwhelmed dengan tugas kuliah.",
    "history": []
  }'
```

**Response:**
```json
{
  "reply": "Halo! Terima kasih sudah mau cerita ke aku. Wajar sekali merasa lelah dan kewalahan ketika tugas menumpuk. Mau coba ceritakan tugas apa yang paling membebanimu saat ini?"
}
```

---

### Multi-turn Conversation with History (`POST /api/chat`)

```bash
curl -X POST "http://127.0.0.1:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Aku mencoba membaginya jadi beberapa tugas kecil, tapi tetap sulit fokus.",
    "history": [
      {
        "role": "user",
        "content": "Halo HYO, hari ini aku merasa sedikit overwhelmed dengan tugas kuliah."
      },
      {
        "role": "assistant",
        "content": "Halo! Wajar sekali merasa begitu ketika tugas menumpuk. Mau coba ceritakan tugas apa yang paling membebanimu?"
      }
    ]
  }'
```

---

## 9. How to Run Automated Tests

The backend includes a comprehensive automated test suite with **24 unit and integration tests** covering:
- Health check endpoint.
- Valid chat interactions.
- Input validation (empty messages, whitespace, exceeding length).
- Invalid conversation roles and missing fields.
- Gemini API errors (quota/rate-limiting 429, timeout 504, service unavailable 503).
- Empty/unparseable Gemini responses (502).
- Conversation history truncation and chronological order.
- Crisis screening and safety protocol triggers.
- CORS preflight and headers.

### Run Tests

From inside `backend/`:

```bash
pytest
```

For verbose output with test names:

```bash
pytest -v
```

> **Note on Test Isolation:** Automated tests mock all Gemini API calls using dependency injection (`app.dependency_overrides`). Tests execute instantaneously, do not require a live API key, and consume zero API quota.

---

## 10. Current Limitations and Future Integration Steps

### Current Limitations
1. **Stateless In-Memory:** Conversation history is stored and managed on the client side. If the user refreshes their browser, the conversation resets unless cached in local storage.
2. **Safety Screening Heuristics:** Automated crisis screening serves as an immediate safety net, but automated keyword and regex screening cannot replace human clinical risk evaluation.
3. **Non-Streaming Responses:** The API currently returns complete responses once generated. Real-time streaming (SSE) can be added for progressive typing effects.

### Future Integration Steps
1. **Frontend Integration:** Wire `POST /api/chat` into the existing React + Vite frontend (`src/components/screens/AiTalkScreen.tsx`) using `fetch` or `axios`.
2. **Streaming Responses:** Implement server-sent events (`StreamingResponse`) with `generate_content_stream` for typewriter-style UI rendering.
3. **Persistent Conversations:** Introduce an optional database layer (PostgreSQL or Redis) with user authentication, conversation archival, and end-to-end data encryption.
4. **Enhanced Clinical Safety:** Upgrade the safety screening layer to incorporate dedicated fine-tuned classification models and direct human crisis triage connections.
5. **Speech Support:** Connect browser Speech-to-Text (STT) and Text-to-Speech (TTS) to create a conversational voice companion.
