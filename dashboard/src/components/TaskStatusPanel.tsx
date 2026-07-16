import type { TaskDueSummary, TaskDueView } from "../types";
import { TaskStatusCard } from "./TaskStatusCard";

interface TaskStatusPanelProps {
  tasks: TaskDueView[];
  summary: TaskDueSummary;
  lastCheckedAt?: string;
}

export function TaskStatusPanel({
  tasks,
  summary,
  lastCheckedAt,
}: TaskStatusPanelProps) {
  return (
    <section className="mt-5 space-y-5">
      <div className="soft-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">TASK STATUS</p>
            <h2 className="panel-title">任务状态板</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              小屋只根据已有任务数据判断时间，不会自动执行任务，也不会修改任务状态。
            </p>
            {lastCheckedAt && (
              <p className="mt-1 text-xs text-slate-400">数据读取时间：{lastCheckedAt}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:flex sm:text-left">
            <Counter label="已到点" value={summary.due} tone="rose" />
            <Counter label="即将到点" value={summary.soon} tone="amber" />
            <Counter label="需检查" value={summary.invalid} tone="orange" />
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <section className="soft-card p-5 text-sm text-slate-600">
          现在还没有公开任务数据。接入本地只读任务源后，这里会显示脱敏后的提醒状态。
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {tasks.map((task) => (
            <TaskStatusCard key={`${task.group}-${task.id}`} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}

interface CounterProps {
  label: string;
  value: number;
  tone: "rose" | "amber" | "orange";
}

function Counter({ label, value, tone }: CounterProps) {
  const toneClass = {
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    orange: "bg-orange-50 text-orange-700 ring-orange-200",
  }[tone];

  return (
    <div className={`rounded-2xl px-3 py-2 ring-1 ${toneClass}`}>
      <p className="font-semibold">{label}</p>
      <p className="mt-1 text-lg font-bold leading-none">{value}</p>
    </div>
  );
}
