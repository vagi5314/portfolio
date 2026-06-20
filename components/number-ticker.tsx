"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
  decimals?: number;
}

function render(el: HTMLElement, v: number, decimals: number, suffix: string) {
  if (!el.isConnected) return;
  if (decimals > 0) {
    const fixed = v.toFixed(decimals);
    el.textContent = fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
    return;
  }
  el.textContent = Math.round(v).toLocaleString("en-US") + suffix;
}

export function NumberTicker({
  value,
  suffix = "",
  className,
  duration = 1.6,
  decimals = 0,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      render(el, 0, decimals, suffix);

      const obj = { v: 0 };
      const trig = ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          if (hasRun.current) return;
          hasRun.current = true;
          tweenRef.current = gsap.to(obj, {
            v: value,
            duration,
            ease: "power3.out",
            onUpdate: () => render(el, obj.v, decimals, suffix),
          });
        },
      });
      return () => {
        tweenRef.current?.kill();
        trig.kill();
      };
    },
    { scope: ref }
  );

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {`${(decimals > 0 ? (0).toFixed(decimals) : 0)}${suffix}`}
    </span>
  );
}
