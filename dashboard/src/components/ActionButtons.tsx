import {
  CloudCog,
  Mic2,
  Play,
  RefreshCw,
  RotateCcw,
  Shuffle,
  Sparkles,
  Square,
} from "lucide-react";
import type { GatewayAction } from "../services/api";
import type { GatewayState } from "../types";

interface ActionButtonsProps {
  gatewayStatus: GatewayState;
  loadingAction: GatewayAction | null;
  onAction: (action: GatewayAction) => void;
}

const actions = [
  { action: "start", label: "启动 Gateway", icon: Play, className: "action-sky" },
  { action: "stop", label: "停止 Gateway", icon: Square, className: "action-rose" },
  { action: "restart", label: "重启 Gateway", icon: RotateCcw, className: "action-sun" },
  { action: "refresh", label: "刷新状态", icon: RefreshCw, className: "action-cloud" },
  { action: "switchBackend", label: "切换后端", icon: Shuffle, className: "action-cloud" },
  { action: "restartWsl", label: "重启 WSL", icon: CloudCog, className: "action-sun" },
  { action: "testVoice", label: "测试语音", icon: Mic2, className: "action-sky" },
  {
    action: "reloadPersona",
    label: "重载阳菜人设",
    icon: Sparkles,
    className: "action-leaf",
  },
] as const;

export function ActionButtons({
  gatewayStatus,
  loadingAction,
  onAction,
}: ActionButtonsProps) {
  const gatewayLabel = gatewayStatus === "Running" ? "运行中" : "已停止";

  return (
    <section className="soft-card p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">屋内控制台</p>
          <h2 className="panel-title">快捷操作</h2>
        </div>
        <p className="text-xs text-slate-600">
          Gateway 当前状态：
          <span className="font-semibold text-slate-900">{gatewayLabel}</span>
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3 xl:grid-cols-4">
        {actions.map(({ action, label, icon: Icon, className }) => {
          const isPending = loadingAction === action;
          const disabled =
            loadingAction !== null ||
            (action === "start" && gatewayStatus === "Running") ||
            (action === "stop" && gatewayStatus === "Stopped");

          return (
            <button
              key={action}
              type="button"
              disabled={disabled}
              className={`action-button ${className}`}
              onClick={() => onAction(action)}
            >
              <Icon size={17} className={isPending ? "animate-spin" : ""} />
              {isPending ? "稍等一下…" : label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
