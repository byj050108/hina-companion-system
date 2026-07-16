import type {
  TaskDueSummary,
  TaskDueView,
  TaskGroupKey,
  TaskItem,
  TaskStatusData,
} from "../types";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

const groupLabels: Record<TaskGroupKey, string> = {
  reminders: "日常提醒",
  health_checks: "小屋体检",
  log_checks: "日志检查",
  study_reminders: "学习提醒",
};

const statusRank: Record<TaskDueView["dueStatus"], number> = {
  due: 0,
  soon: 1,
  scheduled: 2,
  invalid_time: 3,
  unscheduled: 4,
};

export function parseTaskDateTime(value: string): Date | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/,
  );

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute
  ) {
    return null;
  }

  return parsed;
}

export function evaluateTaskDueStatus(
  nextRunAt: string | null | undefined,
  now: Date,
): Pick<TaskDueView, "dueStatus" | "dueLabel" | "dueDescription" | "nextRunTime"> {
  if (!nextRunAt) {
    return {
      dueStatus: "unscheduled",
      dueLabel: "未安排时间",
      dueDescription: "还没安排具体时间",
      nextRunTime: null,
    };
  }

  const nextRunTime = parseTaskDateTime(nextRunAt);

  if (!nextRunTime) {
    return {
      dueStatus: "invalid_time",
      dueLabel: "时间格式需检查",
      dueDescription: "时间格式好像有点奇怪",
      nextRunTime: null,
    };
  }

  const diff = nextRunTime.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      dueStatus: "due",
      dueLabel: "已到点",
      dueDescription: "这个任务到时间啦",
      nextRunTime,
    };
  }

  if (diff <= THIRTY_MINUTES_MS) {
    return {
      dueStatus: "soon",
      dueLabel: "即将到点",
      dueDescription: "快到时间了，等会儿可以看看",
      nextRunTime,
    };
  }

  return {
    dueStatus: "scheduled",
    dueLabel: "已安排",
    dueDescription: "还没到点，小屋只是先帮你看着",
    nextRunTime,
  };
}

export function flattenTasksWithDueStatus(
  taskStatus: TaskStatusData | null | undefined,
  now: Date,
): TaskDueView[] {
  if (!taskStatus) {
    return [];
  }

  const groups: TaskGroupKey[] = [
    "reminders",
    "health_checks",
    "log_checks",
    "study_reminders",
  ];

  return groups
    .flatMap((group) =>
      (taskStatus[group] ?? []).map((task: TaskItem) => ({
        ...task,
        group,
        groupLabel: groupLabels[group],
        ...evaluateTaskDueStatus(task.next_run_at, now),
      })),
    )
    .sort((left, right) => {
      const statusDiff = statusRank[left.dueStatus] - statusRank[right.dueStatus];
      if (statusDiff !== 0) {
        return statusDiff;
      }

      const leftTime = left.nextRunTime?.getTime() ?? Number.POSITIVE_INFINITY;
      const rightTime = right.nextRunTime?.getTime() ?? Number.POSITIVE_INFINITY;
      return leftTime - rightTime;
    });
}

export function summarizeTaskDue(tasks: TaskDueView[]): TaskDueSummary {
  return tasks.reduce(
    (summary, task) => {
      if (task.dueStatus === "due") {
        summary.due += 1;
      }
      if (task.dueStatus === "soon") {
        summary.soon += 1;
      }
      if (task.dueStatus === "invalid_time") {
        summary.invalid += 1;
      }
      return summary;
    },
    { due: 0, soon: 0, invalid: 0 },
  );
}

export function dueTaskSignature(tasks: TaskDueView[]): string {
  return tasks
    .filter((task) => task.dueStatus === "due")
    .map((task) => task.id)
    .sort()
    .join("|");
}
