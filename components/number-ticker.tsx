"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
  decimals?: number;
}

function format(v: number, decimals: number): string {
  if (decimals > 0) {
    return v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return Math.round(v).toLocaleString("en-US");
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function NumberTicker({
  value,
  suffix = "",
  className,
  duration = 1.6,
  decimals = 0,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<string>(() => format(0, decimals));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setDisplay(format(0, decimals));

    let raf = 0;
    let cancelled = false;

    const animate = () => {
      if (cancelled) return;
      const startTime = performance.now();
      const start = 0;
      const end = value;
      const step = (now: number) => {
        if (cancelled) return;
        const elapsed = now - startTime;
        const t = Math.min(elapsed / (duration * 1000), 1);
        const eased = easeOutCubic(t);
        const current = start + (end - start) * eased;
        setDisplay(format(current, decimals));
        if (t < 1) {
          raf = requestAnimationFrame(step);
        } else {
          setDisplay(format(end, decimals));
        }
      };
      raf = requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver === "undefined") {
      animate();
      return () => {
        cancelled = true;
        if (raf) cancelAnimationFrame(raf);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            animate();
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);

    const fallback = window.setTimeout(() => {
      if (!cancelled) {
        animate();
        observer.disconnect();
      }
    }, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, duration, decimals]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
      {suffix}
    </span>
  );
}
