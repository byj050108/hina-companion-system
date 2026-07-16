export type GatewayState = "Running" | "Stopped";

export interface StatusCardData {
  id: string;
  title: string;
  value: string;
  badge?: string;
  details: Array<{ label: string; value: string }>;
  tone: "sky" | "blue" | "mint" | "sun" | "peach";
  icon: "gateway" | "terminal" | "proxy" | "voice" | "persona";
}

export interface ProxyConfig {
  http_proxy: string;
  https_proxy: string;
  all_proxy: string;
  no_proxy: string;
}

export interface ConfigSummary {
  configFile: string;
  gatewayLog: string;
  workspace: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  level: "INFO" | "WARN" | "SUCCESS";
  message: string;
}

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "gateway" | "config" | "voice" | "proxy" | "task";
}

export type TaskGroupKey =
  | "reminders"
  | "health_checks"
  | "log_checks"
  | "study_reminders";

export interface TaskItem {
  id: string;
  title: string;
  time?: string | null;
  next_run_at?: string | null;
  status?: string;
  note?: string;
}

export interface TaskStatusData {
  status?: string;
  message?: string;
  last_checked_at?: string;
  reminders: TaskItem[];
  health_checks: TaskItem[];
  log_checks: TaskItem[];
  study_reminders: TaskItem[];
}

export type TaskDueStatus =
  | "due"
  | "soon"
  | "scheduled"
  | "unscheduled"
  | "invalid_time";

export interface TaskDueView extends TaskItem {
  group: TaskGroupKey;
  groupLabel: string;
  dueStatus: TaskDueStatus;
  dueLabel: string;
  dueDescription: string;
  nextRunTime: Date | null;
}

export interface TaskDueSummary {
  due: number;
  soon: number;
  invalid: number;
}

export interface DashboardData {
  gateway: {
    status: GatewayState;
    pid: number | null;
    uptime: string;
  };
  statusCards: StatusCardData[];
  proxy: ProxyConfig;
  config: ConfigSummary;
  logs: LogEntry[];
  activities: ActivityItem[];
  taskStatus: TaskStatusData | null;
}
