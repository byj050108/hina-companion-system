from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Literal

SourceKind = Literal["task_reminder", "daily_article", "checkin", "web_proactive"]
DecisionKind = Literal["send", "blocked", "skip"]


@dataclass(frozen=True)
class Candidate:
    candidate_id: str
    source: SourceKind
    created_at: datetime
    title: str
    priority: int = 50
    dedupe_key: str | None = None
    context: dict[str, Any] | None = None

    def safe_dict(self) -> dict[str, Any]:
        """Return an audit-safe view; private context is deliberately omitted."""
        data = asdict(self)
        data["created_at"] = self.created_at.isoformat(timespec="seconds")
        data.pop("context", None)
        return data


@dataclass(frozen=True)
class PolicyDecision:
    decision: DecisionKind
    reason: str
    retry_after_seconds: int | None = None
    attempt_id: str | None = None


@dataclass(frozen=True)
class DeliveryReceipt:
    attempt_id: str
    accepted: bool
    adapter_message_id: str | None = None
    error_code: str | None = None
