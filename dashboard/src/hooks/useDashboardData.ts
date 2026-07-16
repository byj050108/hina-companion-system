import { useCallback, useEffect, useState } from "react";
import {
  fetchDashboardData,
  runMockAction,
  type GatewayAction,
} from "../services/api";
import type { DashboardData } from "../types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<GatewayAction | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setData(await fetchDashboardData());
    } catch (unknownError) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Dashboard 数据读取失败",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const nextData = await fetchDashboardData();
        if (!cancelled) {
          setData(nextData);
        }
      } catch (unknownError) {
        if (!cancelled) {
          setError(
            unknownError instanceof Error
              ? unknownError.message
              : "Dashboard 数据读取失败",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const runAction = useCallback(async (action: GatewayAction) => {
    setPendingAction(action);
    setError(null);

    try {
      setData(await runMockAction(action));
    } catch (unknownError) {
      setError(
        unknownError instanceof Error ? unknownError.message : "模拟操作失败",
      );
    } finally {
      setPendingAction(null);
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    pendingAction,
    reload,
    runAction,
  };
}
