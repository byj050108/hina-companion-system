from __future__ import annotations

import json
import urllib.request
from dataclasses import dataclass
from typing import Protocol

from .models import DeliveryReceipt


class ChannelAdapter(Protocol):
    def send(self, attempt_id: str, text: str) -> DeliveryReceipt: ...


@dataclass
class FakeChannel:
    fail_first: bool = False
    calls: int = 0

    def send(self, attempt_id: str, text: str) -> DeliveryReceipt:
        self.calls += 1
        if self.fail_first and self.calls == 1:
            return DeliveryReceipt(attempt_id, False, error_code="simulated_timeout")
        return DeliveryReceipt(attempt_id, True, adapter_message_id=f"demo-{self.calls}")


class HermesOpenAIAdapter:
    def __init__(self, endpoint: str, api_key: str, session_id: str = "hina-companion"):
        self.endpoint = endpoint.rstrip("/") + "/v1/chat/completions"
        self.api_key = api_key
        self.session_id = session_id

    def compose(self, prompt: str, model: str = "default") -> str:
        if not self.api_key:
            raise RuntimeError("HERMES_API_KEY is required for live mode")
        payload = json.dumps({"model": model, "messages": [{"role": "user", "content": prompt}]}).encode()
        request = urllib.request.Request(self.endpoint, data=payload, headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "X-Hermes-Session-Id": self.session_id,
        })
        with urllib.request.urlopen(request, timeout=120) as response:
            body = json.loads(response.read())
        return (body["choices"][0]["message"]["content"] or "").strip()
