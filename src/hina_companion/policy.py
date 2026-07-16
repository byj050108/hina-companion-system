from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from typing import Callable

from .models import Candidate, PolicyDecision
from .store import JsonStateStore

DEFAULT_COOLDOWN_MATRIX = {
    "task_reminder": {"task_reminder": 60, "daily_article": 30, "checkin": 30, "web_proactive": 30},
    "daily_article": {"task_reminder": 120, "daily_article": 120, "checkin": 120, "web_proactive": 120},
    "checkin": {"task_reminder": 120, "daily_article": 120, "checkin": 120, "web_proactive": 120},
    "web_proactive": {"task_reminder": 120, "daily_article": 120, "checkin": 120, "web_proactive": 120},
}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def parse_time(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value)
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


class PolicyEngine:
    """Atomically evaluates and reserves a proactive delivery attempt."""

    def __init__(
        self,
        store: JsonStateStore,
        matrix: dict[str, dict[str, int]] | None = None,
        clock: Callable[[], datetime] = utc_now,
        retry_cooldown_minutes: int = 10,
        reservation_minutes: int = 15,
    ):
        self.store = store
        self.matrix = matrix or DEFAULT_COOLDOWN_MATRIX
        self.clock = clock
        self.retry_cooldown_minutes = retry_cooldown_minutes
        self.reservation_minutes = reservation_minutes
        self._validate_matrix()

    def _validate_matrix(self) -> None:
        kinds = set(self.matrix)
        for source, row in self.matrix.items():
            if set(row) != kinds:
                raise ValueError(f"incomplete cooldown row: {source}")

    @staticmethod
    def default_state() -> dict:
        return {"last_attempt_at": None, "last_sent_at": None, "last_sent_kind": None,
                "reservation": None, "dedupe_keys": [], "attempts": []}

    def evaluate_and_reserve(self, candidate: Candidate) -> PolicyDecision:
        now = self.clock()
        result: PolicyDecision | None = None

        def mutate(state: dict) -> dict:
            nonlocal result
            state = {**self.default_state(), **(state if isinstance(state, dict) else {})}
            dedupe = list(state.get("dedupe_keys") or [])[-500:]
            if candidate.dedupe_key and candidate.dedupe_key in dedupe:
                result = PolicyDecision("skip", "duplicate")
                return state

            reservation = state.get("reservation") or {}
            expires_at = parse_time(reservation.get("expires_at"))
            if expires_at and expires_at > now:
                retry = max(1, int((expires_at - now).total_seconds()))
                result = PolicyDecision("blocked", "attempt_in_flight", retry)
                return state

            last_attempt = parse_time(state.get("last_attempt_at"))
            if last_attempt:
                eligible = last_attempt + timedelta(minutes=self.retry_cooldown_minutes)
                if eligible > now:
                    result = PolicyDecision("blocked", "retry_cooldown", int((eligible-now).total_seconds()))
                    return state

            last_sent = parse_time(state.get("last_sent_at"))
            last_kind = state.get("last_sent_kind")
            if last_sent and last_kind:
                minutes = self.matrix[candidate.source][last_kind]
                eligible = last_sent + timedelta(minutes=minutes)
                if eligible > now:
                    result = PolicyDecision("blocked", "shared_cooldown", int((eligible-now).total_seconds()))
                    return state

            attempt_id = f"att_{secrets.token_hex(8)}"
            expires = now + timedelta(minutes=self.reservation_minutes)
            state["last_attempt_at"] = now.isoformat(timespec="seconds")
            state["reservation"] = {"attempt_id": attempt_id, "candidate_id": candidate.candidate_id,
                                    "expires_at": expires.isoformat(timespec="seconds")}
            state["attempts"] = (state.get("attempts") or [])[-199:] + [{
                "attempt_id": attempt_id, "candidate": candidate.safe_dict(),
                "status": "reserved", "attempted_at": now.isoformat(timespec="seconds"),
                "sent_at": None,
            }]
            if candidate.dedupe_key:
                state["dedupe_keys"] = dedupe + [candidate.dedupe_key]
            result = PolicyDecision("send", "eligible", attempt_id=attempt_id)
            return state

        self.store.update("delivery", self.default_state, mutate)
        assert result is not None
        return result

    def settle(self, attempt_id: str, accepted: bool, adapter_message_id: str | None = None,
               error_code: str | None = None) -> None:
        now = self.clock()

        def mutate(state: dict) -> dict:
            attempts = state.get("attempts") or []
            match = next((item for item in attempts if item.get("attempt_id") == attempt_id), None)
            if match is None:
                raise KeyError(f"unknown attempt: {attempt_id}")
            if match.get("status") != "reserved":
                return state
            match["status"] = "sent" if accepted else "failed"
            match["sent_at"] = now.isoformat(timespec="seconds") if accepted else None
            match["adapter_message_id"] = adapter_message_id if accepted else None
            match["error_code"] = error_code if not accepted else None
            reservation = state.get("reservation") or {}
            if reservation.get("attempt_id") == attempt_id:
                state["reservation"] = None
            if accepted:
                state["last_sent_at"] = match["sent_at"]
                state["last_sent_kind"] = match["candidate"]["source"]
            return state

        self.store.update("delivery", self.default_state, mutate)
