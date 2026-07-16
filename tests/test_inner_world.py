from datetime import datetime

from hina_companion.inner_world import InnerWorld, seed_state
from hina_companion.store import JsonStateStore


def test_lazy_catchup_advances_to_today(tmp_path):
    store = JsonStateStore(tmp_path)
    old = seed_state(datetime(2026, 1, 1).date())
    store.update("inner_world", {}, lambda _: old)
    world = InnerWorld(store, clock=lambda: datetime(2026, 1, 5), random_seed=7)
    state = world.load_and_evolve()
    assert state["last_drift_date"] == "2026-01-05"
    assert state["relationship"]["longing"] > 0
    public = world.public_projection(state)
    assert "threads" not in public
    assert public["active_thread_count"] == 2
