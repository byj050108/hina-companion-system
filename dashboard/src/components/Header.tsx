import { Bell, CloudSun, Menu } from "lucide-react";
import { HinaAvatar } from "./HinaAvatar";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="house-panel flex flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-7">
      <div className="flex w-full min-w-0 items-center gap-3 sm:gap-4 md:w-auto">
        <div className="lg:hidden">
          <button
            className="icon-button"
            type="button"
            aria-label="打开导航"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>
        </div>

        <HinaAvatar className="hidden sm:flex" />

        <div className="min-w-0 flex-1 md:flex-none">
          <p className="eyebrow">Hina&apos;s local home</p>
          <h1 className="text-xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-2xl">
            阳菜的小屋
          </h1>
          <p className="mt-0.5 text-sm leading-5 text-slate-600">
            你的本地 agent 小窝 ☁️
          </p>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 md:w-auto md:justify-end">
        <span className="status-pill inline-flex">
          <CloudSun size={15} />
          阳菜醒着呢～
        </span>
        <button className="icon-button relative" type="button" aria-label="通知">
          <Bell size={19} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-hina-sun ring-2 ring-white" />
        </button>
        <div className="hidden min-w-0 items-center gap-3 rounded-2xl border border-hina-line bg-white/80 px-3 py-2 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hina-cloud text-sm font-bold text-hina-sky-deep">
            H
          </div>
          <div className="pr-1">
            <p className="text-sm font-semibold text-slate-800">Hermes Agent v0.4.2</p>
            <p className="text-xs text-slate-500">claude-3-5-sonnet</p>
          </div>
        </div>
      </div>
    </header>
  );
}
