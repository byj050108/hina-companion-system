from __future__ import annotations

from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo


def parse_due(value: Any, timezone_name: str = "Asia/Shanghai") -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.strptime(value.strip(), "%Y-%m-%d %H:%M")
        return parsed.replace(tzinfo=ZoneInfo(timezone_name))
    except ValueError:
        return None


def due_tasks(payload: dict, now: datetime, category: str = "reminders") -> list[dict]:
    tasks = payload.get(category, [])
    if not isinstance(tasks, list):
        return []
    result = []
    for item in tasks:
        if not isinstance(item, dict) or str(item.get("status", "")).lower() == "done":
            continue
        due = parse_due(item.get("next_run_at"), str(now.tzinfo))
        if due and due <= now:
            result.append({
                "id": str(item.get("id") or "unknown"),
                "title": str(item.get("title") or "Untitled reminder"),
                "next_run_at": item.get("next_run_at"),
                "status": item.get("status", "pending"),
            })
    return result
