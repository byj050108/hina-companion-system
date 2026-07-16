from __future__ import annotations

import fcntl
import json
import os
import tempfile
from pathlib import Path
from typing import Any, Callable


class JsonStateStore:
    """Small local-first store with process-safe locking and atomic replacement."""

    def __init__(self, root: Path):
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def path(self, name: str) -> Path:
        if not name.replace("_", "").replace("-", "").isalnum():
            raise ValueError("state name must be alphanumeric")
        return self.root / f"{name}.json"

    def read(self, name: str, default: Any) -> Any:
        path = self.path(name)
        lock_path = path.with_suffix(".lock")
        lock_path.touch(exist_ok=True)
        with lock_path.open("r+") as lock:
            fcntl.flock(lock.fileno(), fcntl.LOCK_SH)
            try:
                if not path.exists():
                    return default() if callable(default) else default
                return json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                return default() if callable(default) else default
            finally:
                fcntl.flock(lock.fileno(), fcntl.LOCK_UN)

    def update(self, name: str, default: Any, mutator: Callable[[Any], Any]) -> Any:
        path = self.path(name)
        lock_path = path.with_suffix(".lock")
        lock_path.touch(exist_ok=True)
        with lock_path.open("r+") as lock:
            fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
            try:
                try:
                    current = json.loads(path.read_text(encoding="utf-8"))
                except (FileNotFoundError, json.JSONDecodeError):
                    current = default() if callable(default) else default
                updated = mutator(current)
                self._atomic_write(path, updated)
                return updated
            finally:
                fcntl.flock(lock.fileno(), fcntl.LOCK_UN)

    @staticmethod
    def _atomic_write(path: Path, data: Any) -> None:
        fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(data, handle, ensure_ascii=False, indent=2)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temp_name, path)
        except BaseException:
            try:
                os.unlink(temp_name)
            except OSError:
                pass
            raise
