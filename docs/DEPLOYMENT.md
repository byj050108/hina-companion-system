# Deployment

## Local demo

```bash
python -m venv .venv
. .venv/bin/activate
pip install -e '.[dev]'
hina-companion demo --state-dir ./data
hina-dashboard-api
```

In another terminal:

```bash
cd dashboard
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` to the read-only Python API on `127.0.0.1:8787`.

## Hermes integration

Set `HERMES_API_URL` and `HERMES_API_KEY` in the process environment or a local `.env` loader. Do not put the key in a Python module, YAML example or systemd unit checked into Git.

A production deployment should:

- keep the dashboard API bound to localhost unless an authenticated reverse proxy is added;
- run proactive gate jobs under a dedicated user;
- store state in a directory writable only by that user;
- inject secrets through systemd `EnvironmentFile=` or a secret manager;
- retain redacted event metadata separately from private conversation storage;
- treat TTS voice assets as private data.

## systemd sketch

```ini
[Unit]
Description=Hina Companion read-only dashboard API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/hina-companion-system
EnvironmentFile=/etc/hina-companion.env
ExecStart=/opt/hina-companion-system/.venv/bin/hina-dashboard-api
Restart=on-failure
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

The API binds to localhost by design. Put nginx/Caddy authentication in front of it before any remote exposure.
