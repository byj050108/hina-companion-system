# Privacy and release boundary

This repository is a clean-room public extraction of a personal local deployment. It intentionally excludes all runtime artifacts and private content.

## Never committed

- chat transcripts, session files and message bodies
- memory/profile files and personal study/life records
- channel IDs, account IDs, tokens, API keys and cookies
- voice reference samples and generated audio
- local logs, cron outputs, state snapshots and backups
- absolute user-home paths or LAN addresses
- production prompts that encode personal facts

## Controls

1. Secrets are loaded from environment variables.
2. `.gitignore` blocks common runtime/private paths.
3. Dashboard output is built from a public projection.
4. Audit records store candidate metadata, never private candidate context.
5. `scripts/secret_scan.py` runs locally and in CI.
6. The example data is fictional.

Before any public release, run:

```bash
python scripts/secret_scan.py .
git status --short
git diff --cached
```

If a credential has ever been committed, deleting it from the latest revision is not enough: rotate it and rewrite history before publishing.
