import {
  FileText,
  Home,
  ListChecks,
  Mic2,
  RadioTower,
  SlidersHorizontal,
  SquareTerminal,
  X,
} from "lucide-react";
import { HinaAvatar } from "./HinaAvatar";

const navigation = [
  { label: "首页", icon: Home },
  { label: "任务", icon: ListChecks },
  { label: "网关", icon: RadioTower },
  { label: "终端", icon: SquareTerminal },
  { label: "配置", icon: SlidersHorizontal },
  { label: "语音", icon: Mic2 },
  { label: "日志", icon: FileText },
];

interface SidebarProps {
  activeItem: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: string) => void;
}

export function Sidebar({
  activeItem,
  isOpen,
  onClose,
  onSelect,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="关闭导航"
          className="fixed inset-0 z-40 bg-sky-950/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar-shell fixed inset-y-3 left-3 z-50 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col p-4 transition-transform duration-300 sm:inset-y-4 sm:left-4 sm:w-[264px] sm:p-5 lg:sticky lg:top-4 lg:z-10 lg:h-[calc(100vh-2rem)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HinaAvatar size="sidebar" />
            <div>
              <p className="font-semibold tracking-tight text-sky-950">阳菜酱 ✨</p>
              <p className="text-xs text-sky-800/70">晴空陪伴型 agent</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="关闭导航"
            className="rounded-xl p-2 text-sky-800/60 hover:bg-white/60 hover:text-sky-900 lg:hidden"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <nav className="mt-7 space-y-2 sm:mt-9" aria-label="主导航">
          {navigation.map(({ label, icon: Icon }) => {
            const active = activeItem === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  onSelect(label);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-white text-hina-sky-deep shadow-md shadow-sky-900/8"
                    : "text-sky-950/70 hover:bg-white/55 hover:text-sky-950"
                }`}
              >
                <Icon size={19} strokeWidth={active ? 2.3 : 1.9} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-note mt-auto rounded-3xl p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-950">
            <CloudDecoration />
            今天天气真好呢～
          </div>
          <p className="text-xs leading-5 text-sky-900/65">
            这里仍然使用模拟数据，不会触碰你的 Hermes 配置。
          </p>
        </div>
      </aside>
    </>
  );
}

function CloudDecoration() {
  return <span aria-hidden="true">☁️</span>;
}
