"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

interface LocalTimeProps {
  timezone?: string;
  className?: string;
  showSeconds?: boolean;
  showMillis?: boolean;
}

export function LocalTime({
  timezone,
  className,
  showSeconds = true,
  showMillis = false,
}: LocalTimeProps) {
  const timeRef = useRef<HTMLTimeElement>(null);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: timezone,
        second: showSeconds ? "2-digit" : undefined,
      }),
    [timezone, showSeconds]
  );

  useEffect(() => {
    const el = timeRef.current;
    if (!el) return;

    const update = () => {
      if (!el.isConnected) return;
      const now = new Date();
      const formatted = formatter.format(now);
      el.textContent = showMillis
        ? `${formatted}:${String(now.getMilliseconds()).padStart(3, "0")}`
        : formatted;
    };
    update();
    const interval = window.setInterval(update, showMillis ? 33 : 1000);
    return () => window.clearInterval(interval);
  }, [formatter, showMillis]);

  return (
    <time
      ref={timeRef}
      className={cn("tabular-nums font-mono text-xs", className)}
      suppressHydrationWarning
    >
      --:--
    </time>
  );
}