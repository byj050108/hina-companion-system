#!/usr/bin/env python3
"""Fail when files contain likely credentials or private deployment identifiers."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

SKIP_DIRS = {".git", ".venv", "node_modules", "dist", "__pycache__", ".pytest_cache"}
SKIP_FILES = {"package-lock.json", "secret_scan.py"}
PATTERNS = {
    "private home path": re.compile(r"/home/(?!example(?:/|\b)|runner(?:/|\b)|user(?:/|\b))[A-Za-z0-9._-]+/"),
    "wechat account id": re.compile(r"[A-Za-z0-9_-]{12,}@im\.wechat"),
    "GitHub token": re.compile(r"\b(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b"),
    "private key block": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "hard-coded bearer": re.compile(r"(?i)authorization[\"']?\s*[:=].{0,20}bearer\s+(?!<|\$\{)[A-Za-z0-9._-]{16,}"),
    "hard-coded secret": re.compile(r"(?i)\b(?:api[_-]?key|token|password|secret|key)\s*=\s*[\"'][A-Za-z0-9_./+-]{24,}[\"']"),
    "known private marker": re.compile(r"192\.168\.112\.1|MiniRPG|cron_status\.json"),
}
TEXT_SUFFIXES = {".py", ".toml", ".yaml", ".yml", ".json", ".md", ".ts", ".tsx", ".js", ".html", ".css", ".txt", ".ini", ".env", ".example", ""}


def iter_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file() or any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.name in SKIP_FILES or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        yield path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", default=".")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    findings = []
    for path in iter_files(root):
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for line_number, line in enumerate(text.splitlines(), 1):
            for label, pattern in PATTERNS.items():
                if pattern.search(line):
                    findings.append(f"{path.relative_to(root)}:{line_number}: {label}")
    if findings:
        print("Potential secrets/private identifiers found:")
        print("\n".join(findings))
        return 1
    print("Secret scan passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
