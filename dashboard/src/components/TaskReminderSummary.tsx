import { AlertCircle, BellRing, Clock3 } from "lucide-react";
import type { TaskDueSummary } from "../types";

interface TaskReminderSummaryProps {
  summary: TaskDueSummary;
  onOpenTasks: () => void;
  compact?: boolean;
}

export function TaskReminderSummary({
  summary,
  onOpenTasks,
  compact = false,
}: TaskReminderSummaryProps) {
  const hasAttention = summary.due > 0 || summary.soon > 0 || summary.invalid > 0;

  return (
    <section className={`soft-card p-4 sm:p-5 ${compact ? "h-full" : ""}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">任务轻提醒</p>
          <h2 className="panel-title">待处理任务</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {hasAttention
              ? `有 ${summary.due} 个任务已经到点，${summary.soon} 个任务快到时间啦。`
              : "现在没有到点任务，小屋只是安静帮你看着。"}
          </p>
          {summary.invalid > 0 && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <AlertCircle size={13} />
              {summary.invalid} 条时间格式需要检查
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <SummaryBadge
            icon={BellRing}
            label="已到点"
            value={summary.due}
            tone="rose"
          />
          <SummaryBadge
            icon={Clock3}
            label="快到了"
            value={summary.soon}
            tone="amber"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenTasks}
        className="action-button action-sky mt-4 w-full sm:w-auto"
      >
        去任务板看看
      </button>
    </section>
  );
}

interface SummaryBadgeProps {
  icon: typeof BellRing;
  label: string;
  value: number;
  tone: "rose" | "amber";
}

function SummaryBadge({ icon: Icon, label, value, tone }: SummaryBadgeProps) {
  const toneClass =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div className={`rounded-2xl border px-3 py-2 text-sm ${toneClass}`}>
      <p className="flex items-center gap-1.5 text-xs font-semibold">
        <Icon size={13} />
        {label}
      </p>
      <p className="mt-1 text-xl font-bold leading-none">{value}</p>
    </div>
  );
}
