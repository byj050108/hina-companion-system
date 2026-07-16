from datetime import datetime, timedelta, timezone

from hina_companion.models import Candidate
from hina_companion.policy import PolicyEngine
from hina_companion.store import JsonStateStore


def candidate(identifier: str, source: str = "checkin", dedupe: str | None = None) -> Candidate:
    return Candidate(identifier, source, datetime(2026, 1, 1, tzinfo=timezone.utc), identifier,
                     dedupe_key=dedupe)


def test_attempt_and_sent_are_separate(tmp_path):
    now = datetime(2026, 1, 1, 9, tzinfo=timezone.utc)
    engine = PolicyEngine(JsonStateStore(tmp_path), clock=lambda: now, retry_cooldown_minutes=0)
    first = engine.evaluate_and_reserve(candidate("one"))
    assert first.decision == "send"
    state = engine.store.read("delivery", {})
    assert state["last_attempt_at"] is not None
    assert state["last_sent_at"] is None
    engine.settle(first.attempt_id, False, error_code="timeout")
    state = engine.store.read("delivery", {})
    assert state["last_sent_at"] is None
    assert state["attempts"][-1]["status"] == "failed"


def test_success_advances_shared_cooldown(tmp_path):
    now = datetime(2026, 1, 1, 9, tzinfo=timezone.utc)
    current = {"value": now}
    engine = PolicyEngine(JsonStateStore(tmp_path), clock=lambda: current["value"], retry_cooldown_minutes=0)
    first = engine.evaluate_and_reserve(candidate("one", "task_reminder"))
    engine.settle(first.attempt_id, True, "adapter-1")
    current["value"] = now + timedelta(minutes=31)
    checkin = engine.evaluate_and_reserve(candidate("two", "checkin"))
    assert checkin.decision == "blocked"
    assert checkin.reason == "shared_cooldown"
    current["value"] = now + timedelta(minutes=121)
    later = engine.evaluate_and_reserve(candidate("three", "checkin"))
    assert later.decision == "send"


def test_asymmetric_task_reminder_can_pass_earlier(tmp_path):
    now = datetime(2026, 1, 1, 9, tzinfo=timezone.utc)
    current = {"value": now}
    engine = PolicyEngine(JsonStateStore(tmp_path), clock=lambda: current["value"], retry_cooldown_minutes=0)
    first = engine.evaluate_and_reserve(candidate("one", "daily_article"))
    engine.settle(first.attempt_id, True)
    current["value"] = now + timedelta(minutes=31)
    task = engine.evaluate_and_reserve(candidate("two", "task_reminder"))
    assert task.decision == "send"


def test_dedupe_key_is_idempotent(tmp_path):
    engine = PolicyEngine(JsonStateStore(tmp_path), retry_cooldown_minutes=0)
    first = engine.evaluate_and_reserve(candidate("one", dedupe="daily-1"))
    assert first.decision == "send"
    engine.settle(first.attempt_id, False)
    second = engine.evaluate_and_reserve(candidate("two", dedupe="daily-1"))
    assert second.decision == "skip"
    assert second.reason == "duplicate"
