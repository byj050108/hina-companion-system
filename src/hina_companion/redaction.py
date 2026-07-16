from __future__ import annotations

import re
from typing import Any

_SECRET_PATTERNS = [
    re.compile(r"(?i)(authorization\s*[:=]\s*bearer\s+)[^\s]+"),
    re.compile(r"(?i)((?:api[_-]?key|token|password|secret)\s*[:=]\s*)[^\s,;]+"),
    re.compile(r"\b(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}\b"),
]


def redact_text(value: str) -> str:
    result = value
    for pattern in _SECRET_PATTERNS:
        result = pattern.sub(lambda m: (m.group(1) if m.lastindex else "") + "<redacted>", result)
    result = re.sub(r"/home/[^/\s]+", "${HOME}", result)
    return result


def redact(value: Any) -> Any:
    if isinstance(value, str):
        return redact_text(value)
    if isinstance(value, list):
        return [redact(item) for item in value]
    if isinstance(value, dict):
        safe = {}
        for key, item in value.items():
            if key.lower() in {"message_body", "raw_context", "api_key", "token", "password"}:
                safe[key] = "<redacted>"
            else:
                safe[key] = redact(item)
        return safe
    return value
