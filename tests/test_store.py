from hina_companion.store import JsonStateStore


def test_store_update_persists_atomically(tmp_path):
    store = JsonStateStore(tmp_path)
    store.update("counter", {"value": 0}, lambda state: {"value": state["value"] + 1})
    store.update("counter", {"value": 0}, lambda state: {"value": state["value"] + 1})
    assert store.read("counter", {}) == {"value": 2}


def test_store_rejects_unsafe_state_names(tmp_path):
    store = JsonStateStore(tmp_path)
    try:
        store.read("../secret", {})
    except ValueError:
        pass
    else:
        raise AssertionError("unsafe state name was accepted")
