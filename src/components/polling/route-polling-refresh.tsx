"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

interface RoutePollingRefreshProps {
  intervalMs?: number;
  hiddenIntervalMs?: number;
  refreshOnFocus?: boolean;
  minRefreshGapMs?: number;
}

export function RoutePollingRefresh({
  intervalMs = 2 * 60 * 1000,
  hiddenIntervalMs,
  refreshOnFocus = true,
  minRefreshGapMs = 5000,
}: RoutePollingRefreshProps) {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);
  const lastRefreshAtRef = useRef(0);

  const activeInterval = useMemo(
    () => Math.max(1000, intervalMs),
    [intervalMs],
  );
  const backgroundInterval = useMemo(() => {
    const fallback = Math.max(activeInterval * 3, 10 * 60 * 1000);
    return Math.max(activeInterval, hiddenIntervalMs ?? fallback);
  }, [activeInterval, hiddenIntervalMs]);

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const refreshIfNeeded = () => {
      const now = Date.now();
      if (now - lastRefreshAtRef.current < minRefreshGapMs) {
        return;
      }
      lastRefreshAtRef.current = now;
      router.refresh();
    };

    const scheduleNext = () => {
      clearTimer();
      const delay =
        document.visibilityState === "visible"
          ? activeInterval
          : backgroundInterval;
      timeoutRef.current = window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          refreshIfNeeded();
        }
        scheduleNext();
      }, delay);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshIfNeeded();
      }
      scheduleNext();
    };

    const onFocus = () => {
      if (!refreshOnFocus) {
        return;
      }
      refreshIfNeeded();
      scheduleNext();
    };

    scheduleNext();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      clearTimer();
    };
  }, [
    activeInterval,
    backgroundInterval,
    minRefreshGapMs,
    refreshOnFocus,
    router,
  ]);

  return null;
}
