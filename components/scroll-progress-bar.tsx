"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function ScrollProgressBar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;

    let raf = 0;

    const apply = (p: number) => {
      gsap.set(bar, { scaleX: p, transformOrigin: "0% 50%" });
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const h =
          document.documentElement.scrollHeight - window.innerHeight || 1;
        apply(Math.min(1, Math.max(0, window.scrollY / h)));
      });
    };

    const l = (window as unknown as { __lenis?: { on: (e: string, fn: (s: { scroll: number; limit: number; progress: number }) => void) => void; off: (e: string, fn: (s: { scroll: number; limit: number; progress: number }) => void) => void } }).__lenis;
    if (l) {
      const onLenis = (s: { progress: number }) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          apply(s.progress);
        });
      };
      l.on("scroll", onLenis);
      apply(0);
      return () => {
        l.off("scroll", onLenis);
        if (raf) cancelAnimationFrame(raf);
      };
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 top-0 h-px bg-bone/10"
      style={{ zIndex: 'var(--z-progress-bar)' } as React.CSSProperties}
    >
      <div
        ref={ref}
        className={cn("h-full w-full bg-rust")}
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}