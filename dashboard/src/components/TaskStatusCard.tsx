import { AlertCircle, Bell, CalendarClock, Clock3 } from "lucide-react";
import type { TaskDueStatus, TaskDueView } from "../types";

interface TaskStatusCardProps {
  task: TaskDueView;
}

const statusStyle: Record<TaskDueStatus, string> = {
  due: "border-rose-200 bg-rose-50 text-rose-700",
  soon: "border-amber-200 bg-amber-50 text-amber-700",
  scheduled: "border-sky-200 bg-sky-50 text-sky-700",
  unscheduled: "border-slate-200 bg-slate-50 text-slate-600",
  invalid_time: "border-orange-200 bg-orange-50 text-orange-700",
};

const statusIcon: Record<TaskDueStatus, typeof Bell> = {
  due: Bell,
  soon: Clock3,
  scheduled: CalendarClock,
  unscheduled: CalendarClock,
  invalid_time: AlertCircle,
};

export function TaskStatusCard({ task }: TaskStatusCardProps) {
  const Icon = statusIcon[task.dueStatus];

  return (
    <article className="soft-card overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-hina-sky-deep">{task.groupLabel}</p>
          <h3 className="mt-1 break-words text-base font-semibold text-slate-900">
            {task.title}
          </h3>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusStyle[task.dueStatus]}`}
        >
          <Icon size={13} />
          {task.dueLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <p className="min-w-0 break-words">
          <span className="font-semibold text-slate-800">下次时间：</span>
          {task.next_run_at ?? "未安排"}
        </p>
        {task.status && (
          <p className="min-w-0 break-words">
            <span className="font-semibold text-slate-800">状态：</span>
            {task.status}
          </p>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">{task.dueDescription}</p>

      {task.note && (
        <p className="mt-3 max-h-24 overflow-y-auto break-words rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
          {task.note}
        </p>
      )}
    </article>
  );
}
