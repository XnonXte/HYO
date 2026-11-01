"""Crisis safety screening service and architecture.

IMPORTANT SAFETY NOTICE & LIMITATIONS:
Automated crisis detection in AI mental wellness applications cannot substitute for
professional clinical risk assessment. The heuristics and interfaces provided here
represent an initial architectural boundary and preliminary defense-in-depth screening layer.
No automated text classifier can guarantee 100% detection accuracy of self-harm or suicidal ideation.

CRITICAL OPERATIONAL RULES:
1. Never claim or imply that emergency responders or medical personnel have been contacted.
2. Never claim that crisis detection is clinically verified or infallible.
3. When acute crisis or imminent self-harm is detected, prioritize immediate human assistance
   and verified, free emergency helplines.
"""

from abc import ABC, abstractmethod
from enum import Enum
import logging
import re
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.chat import ChatMessage

logger = logging.getLogger(__name__)


class RiskLevel(str, Enum):
    """Categorized risk severity level."""

    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class SafetyAssessment(BaseModel):
    """Result of safety screening on user conversation."""

    is_crisis: bool = Field(
        default=False,
        description="Indicates whether immediate crisis protocol must be activated",
    )
    risk_level: RiskLevel = Field(
        default=RiskLevel.NONE,
        description="Assessed risk level category",
    )
    crisis_response: Optional[str] = Field(
        default=None,
        description="Compassionate crisis response with emergency resources if is_crisis is True",
    )
    detected_signals: List[str] = Field(
        default_factory=list,
        description="Non-sensitive categorical descriptors of detected signals (no PII)",
    )
    requires_human_escalation: bool = Field(
        default=False,
        description="Flag indicating recommendation for immediate human professional intervention",
    )
    disclaimer: str = Field(
        default=(
            "Automated screening is not a clinical diagnosis. If you or someone you know "
            "is in immediate danger, please contact local emergency services or a crisis hotline."
        ),
        description="Standard safety disclosure",
    )


class BaseSafetyService(ABC):
    """Abstract interface for crisis safety and risk assessment.

    Designed to decouple safety classification from LLM generation logic, allowing
    future integration of specialized clinical safety models, human-in-the-loop
    escalation pathways, or third-party crisis triage APIs.
    """

    @abstractmethod
    async def assess(
        self,
        message: str,
        history: Optional[List[ChatMessage]] = None,
    ) -> SafetyAssessment:
        """Screen user message and conversational context for crisis indicators.

        Args:
            message: The user's current message.
            history: Recent conversation history context.

        Returns:
            SafetyAssessment containing risk level, crisis flag, and optional crisis response.
        """
        pass


class CrisisSafetyService(BaseSafetyService):
    """Initial implementation of safety screening service.

    Provides multi-signal pattern screening for both Bahasa Indonesia and English,
    with compassionate crisis messaging and direct helpline resources.
    """

    # High-confidence explicit self-harm / suicidal ideation intent patterns
    # Note: Regarded as heuristic initial defense, not an authoritative clinical diagnostic.
    _CRITICAL_PATTERNS_ID = [
        r"\b(mau|ingin|pengen|akan|bakal)\s+(bunuh\s*diri|mati\s*aja|akhiri\s*hidup|menghilang\s*selamanya)\b",
        r"\b(bunuh\s*diri|suicide)\b",
        r"\b(sayat|melukai|nyakitin)\s+(diri\s*sendiri|badan\s*sendiri|tubuh)\b",
        r"\b(lebih\s*baik\s*aku\s*mati|capek\s*hidup|gak\s*mau\s*hidup\s*lagi|ga\s*pengen\s*hidup)\b",
        r"\b(minum\s*racun|gantung\s*diri|lompat\s*dari\s*gedung)\b",
    ]

    _CRITICAL_PATTERNS_EN = [
        r"\b(want\s+to|going\s+to|gonna|wanna)\s+(kill\s*myself|die|end\s*my\s*life|commit\s*suicide)\b",
        r"\b(commit\s*suicide|kill\s*myself|slit\s*my\s*wrists?)\b",
        r"\b(better\s*off\s*dead|don'?t\s*want\s*to\s*live|no\s*reason\s*to\s*live)\b",
        r"\b(hang\s*myself|overdose\s*on|jump\s*off\s*a\s*bridge)\b",
        r"\b(self[\s-]*harm|harming\s*myself|cutting\s*myself)\b",
    ]

    def __init__(self) -> None:
        self._compiled_id = [
            re.compile(p, re.IGNORECASE) for p in self._CRITICAL_PATTERNS_ID
        ]
        self._compiled_en = [
            re.compile(p, re.IGNORECASE) for p in self._CRITICAL_PATTERNS_EN
        ]

    def _is_indonesian(self, text: str) -> bool:
        """Heuristic to detect whether the user is primarily speaking Indonesian."""
        id_markers = {
            "aku", "kamu", "saya", "anda", "tidak", "nggak", "gak", "bisa", "mau",
            "karena", "dengan", "untuk", "dalam", "banget", "bgt", "baper", "capek",
            "cape", "pusing", "hidup", "mati", "hari", "ini", "rasa", "lagi", "udah"
        }
        words = set(re.findall(r"\b\w+\b", text.lower()))
        return len(words.intersection(id_markers)) > 0

    def _build_crisis_response_id(self) -> str:
        """Construct empathetic Indonesian crisis response with verified hotlines."""
        return (
            "Aku sangat peduli dengan keselamatanmu dan apa yang kamu rasakan saat ini. "
            "Kamu tidak harus memikul beban berat ini sendirian, dan hidupmu sangat berharga.\n\n"
            "Sebagai AI companion, aku tidak bisa menggantikan bantuan profesional dan "
            "tidak dapat menghubungi layanan darurat untukmu. Tolong segera hubungi orang terdekat "
            "atau layanan bantuan krisis gratis berikut:\n\n"
            "• **Hotline Kesehatan Jiwa Kemenkes (Sejiwa):** 119 (ekstensi 8)\n"
            "• **LISA Suicide Prevention Helpline:** 0811-3855-472 (Tersedia 24 jam / WhatsApp)\n"
            "• **Yayasan Pulih (Konseling Trauma & Psikologis):** +62 811-8436-633\n"
            "• **Layanan Darurat Indonesia:** 112\n\n"
            "Tolong beri tahu seseorang yang kamu percaya sekarang. Kamu berhak mendapatkan bantuan dan dukungan nyata."
        )

    def _build_crisis_response_en(self) -> str:
        """Construct empathetic English crisis response with verified hotlines."""
        return (
            "I hear how much pain you are in right now, and I care deeply about your safety. "
            "You do not have to carry this heavy burden alone, and your life matters.\n\n"
            "As an AI companion, I cannot replace professional care or contact emergency services "
            "on your behalf. Please reach out to someone you trust or connect with a free, confidential "
            "crisis resource right now:\n\n"
            "• **United States / Canada:** Call or text **988** (988 Suicide & Crisis Lifeline)\n"
            "• **Crisis Text Line:** Text **HOME** to **741741**\n"
            "• **United Kingdom:** Call **111** (NHS Mental Health Services) or Samaritans at **116 123**\n"
            "• **International / Worldwide:** Visit **https://findahelpline.com** or **https://www.befrienders.org**\n"
            "• **Emergency Services:** Call your local emergency number (911 / 999 / 112)\n\n"
            "Please reach out to someone who can help you stay safe today. Support is available right now."
        )

    async def assess(
        self,
        message: str,
        history: Optional[List[ChatMessage]] = None,
    ) -> SafetyAssessment:
        """Screen incoming message for critical self-harm or crisis patterns.

        Logs a safety event without logging user message contents to respect privacy.
        """
        detected_signals: List[str] = []

        # Check Indonesian patterns
        for pattern in self._compiled_id:
            if pattern.search(message):
                detected_signals.append("critical_intent_id")
                break

        # Check English patterns
        for pattern in self._compiled_en:
            if pattern.search(message):
                detected_signals.append("critical_intent_en")
                break

        if detected_signals:
            logger.warning(
                "Crisis safety signal triggered. Activating crisis guidance protocol. "
                "No PII or user message logged."
            )
            is_id = self._is_indonesian(message)
            crisis_text = (
                self._build_crisis_response_id()
                if is_id
                else self._build_crisis_response_en()
            )

            return SafetyAssessment(
                is_crisis=True,
                risk_level=RiskLevel.CRITICAL,
                crisis_response=crisis_text,
                detected_signals=detected_signals,
                requires_human_escalation=True,
            )

        return SafetyAssessment(
            is_crisis=False,
            risk_level=RiskLevel.NONE,
            crisis_response=None,
            detected_signals=[],
            requires_human_escalation=False,
        )


def get_safety_service() -> BaseSafetyService:
    """Dependency provider for safety service."""
    return CrisisSafetyService()
