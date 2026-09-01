from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

from .config import Settings
from .dashboard import build_dashboard
from .inner_world import InnerWorld
from .store import JsonStateStore


class DashboardHandler(BaseHTTPRequestHandler):
    settings = Settings.from_env()
    store = JsonStateStore(settings.state_dir)
    inner_world = InnerWorld(store)

    def _json(self, status: int, body: dict) -> None:
        payload = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "http://127.0.0.1:5173")
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path in {"/health", "/api/health"}:
            self._json(200, {"status": "ok"})
        elif path in {"/api/dashboard", "/api/status"}:
            self._json(200, build_dashboard(self.store, self.inner_world))
        elif path == "/api/tasks/status":
            self._json(200, {
                "status": "demo",
                "message": "Public demo does not expose private task content",
                "reminders": [],
                "health_checks": [],
                "log_checks": [],
                "study_reminders": [],
            })
        else:
            self._json(404, {"error": "not_found"})

    def log_message(self, fmt: str, *args: object) -> None:
        return


def main() -> None:
    settings = Settings.from_env()
    server = ThreadingHTTPServer((settings.api_host, settings.api_port), DashboardHandler)
    print(f"Dashboard API: http://{settings.api_host}:{settings.api_port}/api/dashboard")
    server.serve_forever()


if __name__ == "__main__":
    main()
