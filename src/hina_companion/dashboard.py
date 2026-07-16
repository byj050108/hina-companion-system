from __future__ import annotations

from datetime import datetime, timezone

from .inner_world import InnerWorld
from .redaction import redact
from .store import JsonStateStore


def build_dashboard(store: JsonStateStore, inner_world: InnerWorld) -> dict:
    delivery = store.read("delivery", {})
    world = inner_world.load_and_evolve()
    attempts = delivery.get("attempts") or []
    last_attempt = attempts[-1] if attempts else None
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "scheduler": {"status": "healthy", "shared_cooldown": bool(delivery.get("last_sent_at"))},
        "delivery": {
            "last_attempt": last_attempt,
            "last_sent_at": delivery.get("last_sent_at"),
            "last_sent_kind": delivery.get("last_sent_kind"),
            "reservation": delivery.get("reservation"),
        },
        "inner_world": inner_world.public_projection(world),
        "privacy": {"raw_message_logging": False, "redaction": "enabled"},
    }
    return redact(payload)
