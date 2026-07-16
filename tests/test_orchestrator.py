from datetime import datetime, timezone

from hina_companion.adapters import FakeChannel
from hina_companion.models import Candidate
from hina_companion.orchestrator import Orchestrator
from hina_companion.policy import PolicyEngine
from hina_companion.store import JsonStateStore


def test_orchestrator_closes_delivery_loop(tmp_path):
    policy = PolicyEngine(JsonStateStore(tmp_path), retry_cooldown_minutes=0)
    orchestrator = Orchestrator(policy, FakeChannel(), lambda _: "safe demo")
    result = orchestrator.process(Candidate(
        "demo", "task_reminder", datetime.now(timezone.utc), "Demo"
    ))
    assert result["decision"] == "sent"
    assert policy.store.read("delivery", {})["attempts"][-1]["status"] == "sent"
