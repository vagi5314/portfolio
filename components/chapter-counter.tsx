"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";
import { SECTIONS } from "@/lib/sections";

export function ChapterCounter() {
  const [active, setActive] = useState(0);
  const [hasAny, setHasAny] = useState(true);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    let found = false;
    SECTIONS.forEach((s, i) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      found = true;
      const t = ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 45%",
        onEnter: () => setActive(i),
        onEnterBack: () => setActive(i),
      });
      triggers.push(t);
    });
    // Delay setHasAny to next tick to avoid setState-in-effect warning
    const t = setTimeout(() => setHasAny(found), 0);
    return () => {
      clearTimeout(t);
      triggers.forEach((t) => t.kill());
    };
  }, [pathname]);

  if (!isHome || !hasAny) return null;

  const current = SECTIONS[active];

  return (
    <div
      data-cursor-hidden
      aria-label="Chapter counter"
      className="pointer-events-none fixed left-5 top-5 hidden items-center gap-3 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] shadow-sm transition-all duration-500 md:flex"
      style={{ 
        zIndex: 'var(--z-chapter-counter)',
        backgroundColor: 'color-mix(in oklch, var(--background) 70%, transparent)',
        borderColor: 'var(--hairline)',
        color: 'var(--foreground-secondary)'
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 border-r pr-3" style={{ borderColor: 'var(--hairline)' }}>
        <span className="text-[var(--foreground)]" style={{ fontVariantNumeric: "tabular-nums" }}>{current.n}</span>
        <span className="opacity-40">/</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{SECTIONS.length.toString().padStart(2, "0")}</span>
      </div>
      <div className="relative overflow-hidden h-[1lh] pr-2">
         <div key={current.id} className="animate-slide-up-fade text-[var(--foreground)]">
           {current.label}
         </div>
      </div>
    </div>
  );
}


export function KeyboardNav() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target?.isContentEditable ?? false)
      ) {
        return;
      }
      const l = (window as unknown as { __lenis?: { scrollTo: (t: Element | number | string, o?: { offset?: number }) => void } }).__lenis;
      if (!l) return;
      if (e.key === "j" || e.key === "J") {
        l.scrollTo(window.scrollY + window.innerHeight * 0.85, { offset: 0 });
      } else if (e.key === "k" || e.key === "K") {
        l.scrollTo(window.scrollY - window.innerHeight * 0.85, { offset: 0 });
      } else if (/^[1-9]$/.test(e.key)) {
        const i = parseInt(e.key, 10) - 1;
        const s = SECTIONS[i];
        if (s) {
          const el = document.getElementById(s.id);
          if (el) l.scrollTo(el, { offset: -24 });
        }
      } else if (e.key === "Escape") {
        l.scrollTo(0, { offset: 0 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}

export function ChapterHelp() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && !(e.target instanceof HTMLInputElement)) {
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <button
        data-cursor-hidden
        onClick={() => setOpen(true)}
        aria-label="Keyboard shortcuts"
        className="fixed bottom-5 left-5 hidden h-7 w-7 place-items-center rounded-full border border-bone/20 bg-ink-2/90 font-mono text-xs text-bone-2 transition-colors hover:border-rust hover:text-rust md:grid"
        style={{ zIndex: 'var(--z-chapter-counter)' } as React.CSSProperties}
      >
        ?
      </button>
      {open && (
        <div
          data-cursor-hidden
          className="fixed inset-0 grid place-items-center bg-ink/80 backdrop-blur-sm"
          style={{ zIndex: 'var(--z-modal)' } as React.CSSProperties}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md border border-bone/15 bg-ink-2 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p               className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-bone-2">
              Keyboard
            </p>
            <ul className="space-y-3 font-mono text-sm text-bone-2">
              <li className="flex justify-between">
                <span>1 – 9</span>
                <span className="text-bone">Jump to chapter</span>
              </li>
              <li className="flex justify-between">
                <span>J</span>
                <span className="text-bone">Next section</span>
              </li>
              <li className="flex justify-between">
                <span>K</span>
                <span className="text-bone">Prev section</span>
              </li>
              <li className="flex justify-between">
                <span>Esc</span>
                <span className="text-bone">Back to top</span>
              </li>
            </ul>
            <button
              onClick={() => setOpen(false)}
              className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-bone-2 transition-colors hover:text-rust"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
