import { dashboardMock } from "../data/mockData";
import type {
  ActivityItem,
  ConfigSummary,
  DashboardData,
  GatewayState,
  LogEntry,
  ProxyConfig,
  TaskStatusData,
} from "../types";

export type GatewayAction =
  | "start"
  | "stop"
  | "restart"
  | "refresh"
  | "switchBackend"
  | "restartWsl"
  | "testVoice"
  | "reloadPersona";

type GatewayStatus = DashboardData["gateway"];

const clone = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
};

const mockState = clone(dashboardMock);

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const gatewayLog = (
  message: string,
  level: LogEntry["level"] = "INFO",
): LogEntry => ({
  id: Date.now(),
  timestamp: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
  level,
  message,
});

const emptyTaskStatus = (): TaskStatusData => ({
  status: "unavailable",
  message: "任务状态接口暂时不可用",
  reminders: [],
  health_checks: [],
  log_checks: [],
  study_reminders: [],
});

const normalizeTaskStatus = (value: Partial<TaskStatusData>): TaskStatusData => ({
  status: value.status,
  message: value.message,
  last_checked_at: value.last_checked_at,
  reminders: Array.isArray(value.reminders) ? value.reminders : [],
  health_checks: Array.isArray(value.health_checks) ? value.health_checks : [],
  log_checks: Array.isArray(value.log_checks) ? value.log_checks : [],
  study_reminders: Array.isArray(value.study_reminders) ? value.study_reminders : [],
});

const setGatewayState = (status: GatewayState) => {
  mockState.gateway.status = status;
  mockState.gateway.pid = status === "Running" ? 284 : null;
  mockState.gateway.uptime = status === "Running" ? "刚刚启动" : "-";
  mockState.statusCards = mockState.statusCards.map((card) =>
    card.id === "gateway"
      ? {
          ...card,
          value: status === "Running" ? "运行中" : "已停止",
          badge: status === "Running" ? "状态良好" : "正在休息",
          details: [
            {
              label: "进程 ID",
              value: mockState.gateway.pid?.toString() ?? "-",
            },
            { label: "运行时长", value: mockState.gateway.uptime },
            { label: "监听端口", value: "Gateway 默认端口" },
          ],
        }
      : card,
  );
};

const mockActionMessages: Record<
  Exclude<GatewayAction, "start" | "stop" | "restart" | "refresh">,
  string
> = {
  switchBackend: "已模拟切换 Terminal 后端",
  restartWsl: "已模拟提交 WSL 重启请求",
  testVoice: "语音测试完成，阳菜可以正常说话",
  reloadPersona: "阳菜人设已重新载入",
};

export async function fetchTaskStatus(): Promise<TaskStatusData> {
  try {
    const response = await fetch("/api/tasks/status", {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`任务状态接口返回 ${response.status}`);
    }

    return normalizeTaskStatus((await response.json()) as Partial<TaskStatusData>);
  } catch {
    return emptyTaskStatus();
  }
}

interface PublicStatus {
  generated_at?: string;
  scheduler?: { status?: string; shared_cooldown?: boolean };
  delivery?: { last_sent_at?: string | null; last_sent_kind?: string | null };
  inner_world?: { mood?: string; active_thread_count?: number };
  privacy?: { redaction?: string; raw_message_logging?: boolean };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const dashboardData = clone(mockState);
  try {
    const response = await fetch("/api/dashboard", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      const status = (await response.json()) as PublicStatus;
      dashboardData.statusCards = dashboardData.statusCards.map((card) => {
        if (card.id === "gateway") {
          return {
            ...card,
            value: status.scheduler?.status === "healthy" ? "运行中" : "状态未知",
            badge: status.scheduler?.shared_cooldown ? "冷却已启用" : "等待首次发送",
          };
        }
        if (card.id === "persona") {
          return {
            ...card,
            value: status.inner_world?.mood ?? "未初始化",
            details: [
              { label: "活跃思绪", value: String(status.inner_world?.active_thread_count ?? 0) },
              { label: "隐私脱敏", value: status.privacy?.redaction ?? "unknown" },
            ],
          };
        }
        return card;
      });
      dashboardData.logs = [
        gatewayLog(`只读状态已同步：${status.generated_at ?? "刚刚"}`, "SUCCESS"),
        ...dashboardData.logs.slice(0, 5),
      ];
    }
  } catch {
    dashboardData.logs = [gatewayLog("后端不可用，已降级到脱敏演示数据", "WARN"), ...dashboardData.logs];
  }
  dashboardData.taskStatus = await fetchTaskStatus();
  return dashboardData;
}

export async function fetchGatewayStatus(): Promise<GatewayStatus> {
  await wait(180);
  return clone(mockState.gateway);
}

export async function fetchProxyConfig(): Promise<ProxyConfig> {
  await wait(180);
  return clone(mockState.proxy);
}

export async function fetchConfigSummary(): Promise<ConfigSummary> {
  await wait(180);
  return clone(mockState.config);
}

export async function fetchGatewayLogs(): Promise<LogEntry[]> {
  await wait(180);
  return clone(mockState.logs);
}

export async function fetchRecentActivity(): Promise<ActivityItem[]> {
  await wait(180);
  return clone(mockState.activities);
}

export async function runMockAction(
  action: GatewayAction,
): Promise<DashboardData> {
  // Mock only: real Hermes control commands belong to a later D/E phase.
  await wait(action === "refresh" ? 450 : 750);

  if (action === "start") {
    setGatewayState("Running");
    mockState.logs.push(gatewayLog("模拟 Gateway 启动完成", "SUCCESS"));
  } else if (action === "stop") {
    setGatewayState("Stopped");
    mockState.logs.push(gatewayLog("模拟 Gateway 已优雅停止", "WARN"));
  } else if (action === "restart") {
    setGatewayState("Running");
    mockState.logs.push(gatewayLog("模拟 Gateway 重启完成", "SUCCESS"));
  } else if (action === "refresh") {
    mockState.logs.push(gatewayLog("Dashboard 状态已刷新"));
  } else {
    mockState.logs.push(gatewayLog(mockActionMessages[action], "SUCCESS"));
  }

  const dashboardData = clone(mockState);
  dashboardData.taskStatus = await fetchTaskStatus();
  return dashboardData;
}
