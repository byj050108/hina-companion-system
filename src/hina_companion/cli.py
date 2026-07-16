from __future__ import annotations

import argparse
import json
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from .adapters import FakeChannel
from .dashboard import build_dashboard
from .inner_world import InnerWorld
from .models import Candidate
from .orchestrator import Orchestrator
from .policy import PolicyEngine
from .store import JsonStateStore


def demo(state_dir: Path) -> dict:
    store = JsonStateStore(state_dir)
    policy = PolicyEngine(store, retry_cooldown_minutes=0)
    channel = FakeChannel()
    orchestrator = Orchestrator(policy, channel, lambda c: f"Demo notification: {c.title}")
    candidate = Candidate("demo-001", "task_reminder", datetime.now(timezone.utc),
                          "Review a fictional engineering note", dedupe_key="demo-task-001")
    result = orchestrator.process(candidate)
    return {"result": result, "dashboard": build_dashboard(store, InnerWorld(store, random_seed=7))}


def main() -> None:
    parser = argparse.ArgumentParser(description="Hina companion orchestration demo")
    parser.add_argument("command", choices=["demo"])
    parser.add_argument("--state-dir", type=Path)
    args = parser.parse_args()
    state_dir = args.state_dir or Path(tempfile.mkdtemp(prefix="hina-demo-"))
    print(json.dumps(demo(state_dir), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
