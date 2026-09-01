# 自研边界

本仓库不是 Hermes Agent 源码副本，而是运行在 Hermes 之上的陪伴型 Agent 扩展层。Docker Compose 在运行时组合官方 Hermes 镜像与本仓库服务；上游版本记录在 `upstream.lock`。

## Hermes Agent 提供

- Agent Loop、模型调用与工具调度
- 会话、Gateway、Cron、Skills 和平台接入
- OpenAI-compatible API Server

## 本仓库实现

- 主动消息共享冷却、reservation 和 Attempt / Sent 状态机
- 并发锁、原子状态写入、幂等和去重
- 跨天懒演进的 Inner World 状态
- Hermes API、消息渠道与 TTS 的适配器边界
- 只暴露脱敏投影的本地 API
- React / PWA 运行状态 Dashboard
- 隐私扫描、虚构演示数据和 CI 发布检查
- 将 Hermes、自研 API 与 Dashboard 组合起来的 Docker 部署层

## 不进入公开仓库

真实人格提示词、聊天记录、长期记忆、用户画像、平台账号、密钥、声音样本和生产状态只保存在私有运行卷中。

## 如何查看贡献

- 核心策略：`src/hina_companion/policy.py`
- 状态存储：`src/hina_companion/store.py`
- 发送闭环：`src/hina_companion/orchestrator.py`
- 状态演进：`src/hina_companion/inner_world.py`
- Dashboard：`dashboard/`
- Docker 组合：`Dockerfile`、`docker-compose.yml`
- 验证：`tests/`、`scripts/secret_scan.py`、`.github/workflows/ci.yml`
