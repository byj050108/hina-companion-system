import { useEffect, useMemo, useRef, useState } from "react";
import { ActionButtons } from "./components/ActionButtons";
import { ActivityPanel } from "./components/ActivityPanel";
import { ConfigPanel } from "./components/ConfigPanel";
import { Header } from "./components/Header";
import { LogPanel } from "./components/LogPanel";
import { Sidebar } from "./components/Sidebar";
import { StatusCard } from "./components/StatusCard";
import { TaskReminderSummary } from "./components/TaskReminderSummary";
import { TaskStatusPanel } from "./components/TaskStatusPanel";
import { useDashboardData } from "./hooks/useDashboardData";
import type { ActivityItem } from "./types";
import {
  dueTaskSignature,
  flattenTasksWithDueStatus,
  summarizeTaskDue,
} from "./utils/taskDue";

function App() {
  const [activeNav, setActiveNav] = useState("首页");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [toast, setToast] = useState<string | null>(null);
  const notifiedDueSignatures = useRef(new Set<string>());
  const { data, error, isLoading, pendingAction, runAction } = useDashboardData();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const taskViews = useMemo(
    () => flattenTasksWithDueStatus(data?.taskStatus, now),
    [data?.taskStatus, now],
  );
  const taskSummary = useMemo(() => summarizeTaskDue(taskViews), [taskViews]);

  useEffect(() => {
    const signature = dueTaskSignature(taskViews);
    if (!signature || notifiedDueSignatures.current.has(signature)) {
      return;
    }

    notifiedDueSignatures.current.add(signature);
    setToast("有几个小任务到时间啦，去任务板看看吧～");
    const timer = window.setTimeout(() => setToast(null), 5200);

    return () => window.clearTimeout(timer);
  }, [taskViews]);

  const activitiesWithTaskDiscovery = useMemo<ActivityItem[]>(() => {
    if (taskSummary.due === 0) {
      return data?.activities ?? [];
    }

    return [
      {
        id: -1,
        title: "发现到期任务",
        description: `有 ${taskSummary.due} 个任务已经到点，小屋提醒你去看看。`,
        time: "刚刚",
        type: "task",
      },
      ...(data?.activities ?? []),
    ];
  }, [data?.activities, taskSummary.due]);

  const openTasks = () => setActiveNav("任务");

  return (
    <div className="min-h-screen overflow-hidden text-slate-800">
      <div className="dream-orb dream-orb-one" />
      <div className="dream-orb dream-orb-two" />
      {toast && (
        <div className="fixed right-3 top-3 z-[70] max-w-[calc(100vw-1.5rem)] rounded-3xl border border-amber-200 bg-white/95 px-4 py-3 text-sm font-semibold text-amber-800 shadow-xl shadow-sky-900/10 backdrop-blur sm:right-6 sm:top-6">
          {toast}
        </div>
      )}

      <div className="relative flex min-h-screen">
        <Sidebar
          activeItem={activeNav}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelect={(item) => {
            setActiveNav(item);
            setSidebarOpen(false);
          }}
        />

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1540px] px-3 pb-8 pt-3 sm:px-5 sm:pb-10 sm:pt-4 lg:px-10 lg:pb-12 lg:pt-8">
            <Header onMenuClick={() => setSidebarOpen(true)} />

            {error && (
              <section className="soft-card mt-5 p-4 text-sm font-medium text-rose-700">
                {error}
              </section>
            )}

            {isLoading || !data ? (
              <section className="soft-card mt-5 p-5 text-sm text-slate-600 sm:p-6">
                正在整理阳菜的小屋…
              </section>
            ) : activeNav === "任务" ? (
              <TaskStatusPanel
                tasks={taskViews}
                summary={taskSummary}
                lastCheckedAt={data.taskStatus?.last_checked_at}
              />
            ) : (
              <>
                <section className="mt-5">
                  <TaskReminderSummary summary={taskSummary} onOpenTasks={openTasks} />
                </section>

                <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
                  <ActionButtons
                    gatewayStatus={data.gateway.status}
                    loadingAction={pendingAction}
                    onAction={runAction}
                  />
                  <TaskReminderSummary
                    summary={taskSummary}
                    onOpenTasks={openTasks}
                    compact
                  />
                </section>

                <section className="mt-5 grid gap-4 md:mt-7 md:grid-cols-2 xl:grid-cols-3">
                  {data.statusCards.map((card) => (
                    <StatusCard key={card.id} card={card} />
                  ))}
                </section>

                <section className="mt-5">
                  <ConfigPanel proxy={data.proxy} config={data.config} />
                </section>

                <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.75fr)]">
                  <LogPanel logs={data.logs} />
                  <ActivityPanel activities={activitiesWithTaskDiscovery} />
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
