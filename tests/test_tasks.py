from datetime import datetime
from zoneinfo import ZoneInfo

from hina_companion.tasks import due_tasks


def test_due_tasks_filters_done_and_future():
    now = datetime(2026, 1, 2, 10, tzinfo=ZoneInfo("Asia/Shanghai"))
    payload = {"reminders": [
        {"id": "due", "title": "Demo due", "next_run_at": "2026-01-02 09:00"},
        {"id": "future", "title": "Demo future", "next_run_at": "2026-01-02 11:00"},
        {"id": "done", "title": "Demo done", "next_run_at": "2026-01-01 09:00", "status": "done"},
    ]}
    assert [task["id"] for task in due_tasks(payload, now)] == ["due"]
