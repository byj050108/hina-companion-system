from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    state_dir: Path
    dashboard_status_file: Path
    api_host: str
    api_port: int
    hermes_api_url: str
    hermes_api_key: str
    tts_endpoint: str
    timezone: str

    @classmethod
    def from_env(cls) -> "Settings":
        state_dir = Path(os.getenv("HINA_STATE_DIR", "./data")).expanduser()
        return cls(
            state_dir=state_dir,
            dashboard_status_file=Path(
                os.getenv("HINA_DASHBOARD_STATUS_FILE", str(state_dir / "dashboard.json"))
            ).expanduser(),
            api_host=os.getenv("HINA_API_HOST", "127.0.0.1"),
            api_port=int(os.getenv("HINA_API_PORT", "8787")),
            hermes_api_url=os.getenv("HERMES_API_URL", "http://127.0.0.1:8642"),
            hermes_api_key=os.getenv("HERMES_API_KEY", ""),
            tts_endpoint=os.getenv("TTS_ENDPOINT", ""),
            timezone=os.getenv("HINA_TIMEZONE", "Asia/Shanghai"),
        )
