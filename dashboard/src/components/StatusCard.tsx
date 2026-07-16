import {
  HeartHandshake,
  Mic2,
  RadioTower,
  SquareTerminal,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import type { StatusCardData } from "../types";

const icons: Record<StatusCardData["icon"], LucideIcon> = {
  gateway: RadioTower,
  terminal: SquareTerminal,
  proxy: Waypoints,
  voice: Mic2,
  persona: HeartHandshake,
};

const tones: Record<
  StatusCardData["tone"],
  { icon: string; glow: string; badge: string }
> = {
  sky: {
    icon: "bg-hina-cloud text-hina-sky-deep",
    glow: "from-hina-sky-soft/70",
    badge: "bg-hina-cloud text-hina-sky-deep ring-hina-line",
  },
  blue: {
    icon: "bg-blue-100 text-blue-700",
    glow: "from-blue-100/80",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  mint: {
    icon: "bg-hina-leaf/55 text-emerald-800",
    glow: "from-hina-leaf/35",
    badge: "bg-hina-leaf/40 text-emerald-800 ring-emerald-200",
  },
  sun: {
    icon: "bg-hina-sun/55 text-amber-800",
    glow: "from-hina-sun/30",
    badge: "bg-hina-sun/40 text-amber-800 ring-amber-200",
  },
  peach: {
    icon: "bg-rose-100 text-rose-700",
    glow: "from-rose-100/60",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
  },
};

interface StatusCardProps {
  card: StatusCardData;
}

export function StatusCard({ card }: StatusCardProps) {
  const Icon = icons[card.icon];
  const tone = tones[card.tone];

  return (
    <article className="soft-card relative min-h-48 overflow-hidden p-5 sm:p-6">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${tone.glow} to-transparent opacity-70`}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone.icon}`}>
            <Icon size={21} />
          </div>
          {card.badge && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone.badge}`}>
              {card.badge}
            </span>
          )}
        </div>
        <p className="mt-6 text-sm font-medium text-slate-600">{card.title}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {card.value}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {card.details.map((detail) => (
            <p key={detail.label} className="min-w-0 break-words text-xs text-slate-600">
              {detail.label}:{" "}
              <span className="font-semibold text-slate-800">{detail.value}</span>
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
