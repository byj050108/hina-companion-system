# Hermes cron integration examples

Hermes cron jobs run in fresh sessions, so prompts must be self-contained. Keep gate scripts deterministic and let the agent handle natural-language composition only after the gate returns `send`.

```bash
# Install the package in a virtual environment first.
python -m venv .venv
. .venv/bin/activate
pip install -e .

# Smoke-test the deterministic pipeline.
hina-companion demo --state-dir ./data
```

A production job can invoke a thin script that creates a `Candidate`, calls `PolicyEngine.evaluate_and_reserve`, asks Hermes to compose only when eligible, and finally calls `settle` with the delivery receipt. Keep channel IDs, tokens, prompts, memory and conversation logs outside the repository.

Suggested source kinds:

- `task_reminder`: high-value due task signal
- `daily_article`: curated reading recommendation
- `checkin`: low-pressure proactive companion message
- `web_proactive`: dashboard/web inbox message
