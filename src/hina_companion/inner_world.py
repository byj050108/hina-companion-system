from __future__ import annotations

import random
from datetime import date, datetime
from typing import Callable

from .store import JsonStateStore

STATE_VERSION = 1

MOOD_LABELS = {
    (1, 1): "bright and energetic",
    (1, -1): "warm and quiet",
    (-1, 1): "restless",
    (-1, -1): "low energy",
    (0, 0): "calm",
}


def _sign(value: float, dead_zone: float = 0.18) -> int:
    if value > dead_zone:
        return 1
    if value < -dead_zone:
        return -1
    return 0


def seed_state(today: date) -> dict:
    return {
        "version": STATE_VERSION,
        "last_drift_date": today.isoformat(),
        "mood": {"valence": 0.1, "energy": 0.0, "label": "calm"},
        "threads": [
            {"category": "media", "note": "A fictional demo series left a small clue."},
            {"category": "music", "note": "A demo playlist has one unresolved track."},
        ],
        "relationship": {"warmth": 0.3, "longing": 0.0},
        "open_loops": [],
    }


class InnerWorld:
    """Deterministic state evolution; private runtime content stays outside public audit views."""

    def __init__(self, store: JsonStateStore, clock: Callable[[], datetime] = datetime.now,
                 random_seed: int | None = None):
        self.store = store
        self.clock = clock
        self.random = random.Random(random_seed)

    def load_and_evolve(self) -> dict:
        today = self.clock().date()

        def mutate(state: dict) -> dict:
            if not isinstance(state, dict) or state.get("version") != STATE_VERSION:
                state = seed_state(today)
            last = date.fromisoformat(state["last_drift_date"])
            days = min(14, max(0, (today - last).days))
            for _ in range(days):
                mood = state["mood"]
                mood["valence"] = round(max(-1, min(1, mood["valence"] + self.random.uniform(-0.12, 0.12))), 3)
                mood["energy"] = round(max(-1, min(1, mood["energy"] + self.random.uniform(-0.15, 0.15))), 3)
                key = (_sign(mood["valence"]), _sign(mood["energy"]))
                if key not in MOOD_LABELS:
                    key = (0, 0)
                mood["label"] = MOOD_LABELS[key]
                relation = state["relationship"]
                relation["longing"] = round(min(1, relation.get("longing", 0) + 0.04), 3)
            state["last_drift_date"] = today.isoformat()
            return state

        return self.store.update("inner_world", lambda: seed_state(today), mutate)

    @staticmethod
    def public_projection(state: dict) -> dict:
        return {
            "version": state.get("version"),
            "last_drift_date": state.get("last_drift_date"),
            "mood": state.get("mood", {}).get("label", "unknown"),
            "active_thread_count": len(state.get("threads") or []),
            "open_loop_count": len(state.get("open_loops") or []),
        }
