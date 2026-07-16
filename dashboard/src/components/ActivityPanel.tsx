import { Clock3 } from "lucide-react";
import type { ActivityItem } from "../types";

interface ActivityPanelProps {
  activities: ActivityItem[];
}

const dotColor = {
  sky: "bg-hina-sky ring-hina-cloud",
  blue: "bg-blue-500 ring-blue-100",
  emerald: "bg-emerald-500 ring-emerald-100",
  amber: "bg-amber-400 ring-amber-100",
};

const activityTone: Record<ActivityItem["type"], keyof typeof dotColor> = {
  gateway: "emerald",
  config: "sky",
  voice: "blue",
  proxy: "amber",
  task: "amber",
};

export function ActivityPanel({ activities }: ActivityPanelProps) {
  return (
    <section className="soft-card h-full p-4 sm:p-6">
      <p className="eyebrow">小屋动态</p>
      <h2 className="panel-title">最近活动</h2>

      <div className="mt-6 space-y-1">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < activities.length - 1 && (
              <span className="absolute left-[6px] top-5 h-[calc(100%-8px)] w-px bg-slate-200" />
            )}
            <span
              className={`relative mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4 ${
                dotColor[activityTone[activity.type]]
              }`}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {activity.description}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock3 size={12} />
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
