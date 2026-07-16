from __future__ import annotations

import json
import urllib.request
from pathlib import Path


class TTSBridge:
    """Optional text-to-speech adapter. Voice samples and credentials stay outside the repo."""

    def __init__(self, endpoint: str):
        self.endpoint = endpoint

    def synthesize(self, text: str, output: Path) -> Path:
        if not self.endpoint:
            raise RuntimeError("TTS_ENDPOINT is not configured")
        request = urllib.request.Request(
            self.endpoint,
            data=json.dumps({"text": text}).encode(),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(request, timeout=120) as response:
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_bytes(response.read())
        return output
