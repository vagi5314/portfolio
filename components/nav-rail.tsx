"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { SECTIONS } from "@/lib/sections";

type LenisLike = {
  scrollTo: (
    target: Element | number | string,
    opts?: { offset?: number; immediate?: boolean; force?: boolean }
  ) => void;
};

declare global {
  interface Window {
    __lenis?: LenisLike;
  }
}

export function NavRail() {
  const [active, setActive] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const triggers: ScrollTrigger[] = [];
    SECTIONS.forEach((s, i) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const t = ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 45%",
        onEnter: () => setActive(i),
        onEnterBack: () => setActive(i),
      });
      triggers.push(t);
    });
    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [isHome]);

  if (!isHome) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(el, { offset: -24, force: true });
    } else {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }
  };

  return (
    <nav
      data-cursor-hidden
      aria-label="Section navigation"
      className="fixed right-4 top-1/2 hidden -translate-y-1/2 md:block"
      style={{ zIndex: 'var(--z-nav-rail)' } as React.CSSProperties}
    >
      <div className="relative flex flex-col items-end gap-5">
        <span
          aria-hidden
          className="pointer-events-none absolute right-[11px] top-2 bottom-2 w-px bg-bone/10"
        />
        {SECTIONS.map((s, i) => {
          const isActive = active === i;
          return (
            <button
              key={s.id}
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              type="button"
              onClick={() => handleClick(s.id)}
              aria-current={isActive ? "step" : undefined}
              aria-controls={s.id}
              aria-label={`Jump to ${s.label}`}
              className="group/dot relative flex items-center justify-end gap-3"
            >
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300",
                  isActive
                    ? "max-w-[160px] opacity-100 text-[var(--foreground)] pr-2"
                    : "max-w-0 opacity-0 text-[var(--foreground-secondary)] group-hover/dot:max-w-[160px] group-hover/dot:opacity-100 group-hover/dot:pr-2 group-hover/dot:bg-ink-2/90 group-hover/dot:rounded-full group-hover/dot:pl-3 group-hover/dot:py-1"
                )}
              >
                {s.n} · {s.label}
              </span>
              <span className="relative grid h-6 w-6 shrink-0 place-items-center">
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -left-2 top-1/2 h-px w-1.5 -translate-y-1/2 bg-rust"
                  />
                )}
                <span
                  className={cn(
                    "block rounded-full border transition-all duration-300",
                    isActive
                      ? "h-2 w-2 border-rust bg-rust shadow-[0_0_12px_rgba(232,90,43,0.6)]"
                      : "h-1.5 w-1.5 border-bone/30 group-hover/dot:border-bone/60"
                  )}
                />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
