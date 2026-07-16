import { Circle, Terminal } from "lucide-react";
import type { LogEntry } from "../types";

interface LogPanelProps {
  logs: LogEntry[];
}

const levelColor = {
  INFO: "text-sky-300",
  WARN: "text-amber-300",
  SUCCESS: "text-emerald-300",
};

export function LogPanel({ logs }: LogPanelProps) {
  return (
    <section className="log-panel overflow-hidden rounded-[28px] text-sky-50 shadow-xl shadow-sky-950/12">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-4 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
            屋内记录
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
            <Terminal size={18} />
            Gateway 日志
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-400">
          <Circle size={8} className="fill-emerald-400 text-emerald-400" />
          持续更新
        </div>
      </div>

      <div className="log-scroll h-[300px] overflow-y-auto px-4 py-4 font-mono text-xs leading-6 sm:h-[330px] sm:px-5 sm:text-[13px]">
        {logs.map((log) => (
          <div
            key={log.id}
            className="grid min-w-0 grid-cols-[62px_48px_minmax(0,1fr)] gap-1.5 sm:grid-cols-[72px_58px_minmax(0,1fr)] sm:gap-2"
          >
            <span className="text-slate-500">{log.timestamp}</span>
            <span className={`font-semibold ${levelColor[log.level]}`}>
              {log.level}
            </span>
            <span className="min-w-0 break-words text-sky-50/90">{log.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
