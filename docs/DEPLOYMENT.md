# Deployment

## Docker Compose

Compose 组合三个边界清晰的服务：官方 Hermes Runtime、本仓库的 Companion API，以及只读 Dashboard。Hermes 源码不会复制到本仓库。

```bash
cp .env.example .env
python - <<'PY'
from pathlib import Path
import secrets

path = Path('.env')
text = path.read_text()
text = text.replace('<set-locally>', secrets.token_hex(24))
path.write_text(text)
PY
docker compose up -d --build
```

打开 `http://127.0.0.1:8080`。Dashboard 只映射到宿主机回环地址；Hermes API 只在 Compose 内部网络中提供给 Companion API。

- `hermes-data`：Hermes 配置、平台配对、Skills、会话和私有记忆
- `companion-state`：主动消息状态和脱敏投影
- `upstream.lock`：构建所依据的 Hermes 发布版、镜像摘要和核对时间

首次运行仍需按照 Hermes 官方流程完成模型与消息平台配置。执行配对命令时使用官方镜像要求的非特权用户，具体以 [Hermes Docker 文档](https://hermes-agent.nousresearch.com/docs/user-guide/docker) 为准。

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
