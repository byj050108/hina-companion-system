import { FileCode2, FolderOpen, Network, ScrollText } from "lucide-react";
import type { ConfigSummary, ProxyConfig } from "../types";

interface ConfigPanelProps {
  proxy: ProxyConfig;
  config: ConfigSummary;
}

const configItems = [
  { key: "configFile", label: "配置文件", icon: FileCode2 },
  { key: "gatewayLog", label: "日志路径", icon: ScrollText },
  { key: "workspace", label: "工作区", icon: FolderOpen },
] as const;

export function ConfigPanel({ proxy, config }: ConfigPanelProps) {
  return (
    <section className="soft-card p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">小屋环境</p>
          <h2 className="panel-title">配置摘要</h2>
        </div>
        <span className="rounded-full bg-hina-sun/40 px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
          模拟数据
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:mt-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl bg-hina-cloud/65 p-4 ring-1 ring-hina-line">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Network size={17} className="text-hina-sky-deep" />
            代理配置
          </div>
          <div className="space-y-3">
            {Object.entries(proxy).map(([key, value]) => (
              <div
                key={key}
                className="grid min-w-0 gap-1 rounded-2xl bg-white/85 px-3 py-2.5 sm:grid-cols-[110px_minmax(0,1fr)]"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {key}
                </span>
                <code className="min-w-0 break-all text-xs text-slate-700">{value}</code>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {configItems.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="flex gap-3 rounded-3xl border border-hina-line bg-white/80 p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hina-cloud text-hina-sky-deep">
                <Icon size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </p>
                <code className="mt-1 block break-all text-xs leading-5 text-slate-700">
                  {config[key]}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
