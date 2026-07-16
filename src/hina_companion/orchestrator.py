from __future__ import annotations

from dataclasses import asdict
from typing import Callable

from .adapters import ChannelAdapter
from .models import Candidate, PolicyDecision
from .policy import PolicyEngine
from .redaction import redact


class Orchestrator:
    def __init__(self, policy: PolicyEngine, channel: ChannelAdapter,
                 composer: Callable[[Candidate], str]):
        self.policy = policy
        self.channel = channel
        self.composer = composer

    def process(self, candidate: Candidate) -> dict:
        decision: PolicyDecision = self.policy.evaluate_and_reserve(candidate)
        if decision.decision != "send":
            return redact(asdict(decision))
        assert decision.attempt_id
        try:
            text = self.composer(candidate)
            receipt = self.channel.send(decision.attempt_id, text)
            self.policy.settle(decision.attempt_id, receipt.accepted,
                               receipt.adapter_message_id, receipt.error_code)
            return redact({"decision": "sent" if receipt.accepted else "failed",
                           "attempt_id": decision.attempt_id,
                           "adapter_message_id": receipt.adapter_message_id,
                           "error_code": receipt.error_code})
        except Exception as exc:
            self.policy.settle(decision.attempt_id, False, error_code=type(exc).__name__)
            return {"decision": "failed", "attempt_id": decision.attempt_id,
                    "error_code": type(exc).__name__}
