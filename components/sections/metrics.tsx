"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NumberTicker } from "@/components/number-ticker";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const metrics = [
  { value: 5.8, suffix: "M", decimals: 1, label: "Rows in production", sub: "AeroMetric training set" },
  { value: 26, suffix: "", decimals: 0, label: "Nations indexed", sub: "Global AI Readiness" },
  { value: 1457, suffix: "", decimals: 0, label: "Skills in vocabulary", sub: "JobFlow · 15 industries" },
  { value: 100, suffix: "/100", decimals: 0, label: "Tests passing", sub: "LeadSentry audit suite" },
];

export function Metrics() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const section = ref.current;
      if (!section) return;

      const headline = section.querySelector(".metrics-headline");
      if (headline) {
        const lines = headline.querySelectorAll(".headline-line");
        gsap.fromTo(
          lines,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: headline,
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      const cards = section.querySelectorAll(".metric-card");
      gsap.fromTo(
        cards,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: section.querySelector(".metrics-grid"),
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      id="metrics"
      className="relative py-(--spacing-section) pb-32 md:pb-40"
      style={{
        background: "var(--background)",
        zIndex: "var(--z-section-content)",
        minHeight: "min(100vh, 720px)",
      } as React.CSSProperties}
    >
      <div className="mx-auto w-full max-w-[1400px] px-6">
        <div className="mb-16 flex items-baseline justify-end font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)] md:pr-[var(--nav-rail-safe)]">
          <span>As of last build · from project bodies</span>
        </div>

        <h2 className="metrics-headline mb-16 font-[family-name:var(--font-instrument-serif)] text-4xl leading-[1.1] tracking-[-0.01em] text-[var(--foreground)] text-balance md:text-6xl">
          <span className="headline-line block">By the <em className="italic text-[var(--accent)]">numbers</em>,</span>
          <span className="headline-line block">as of today.</span>
        </h2>

        <div className="metrics-grid grid grid-cols-2 gap-12 md:grid-cols-4 md:gap-8">
          {metrics.map((m, i) => (
            <div key={i} className="metric-card space-y-2 border-l pl-6" style={{ borderColor: 'color-mix(in oklch, var(--foreground) 12%, transparent)' }}>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)]">
                {m.label}
              </p>
              <p className="font-display text-5xl font-light leading-none tracking-[-0.04em] text-[var(--foreground)] md:text-7xl">
                <NumberTicker value={m.value} suffix={m.suffix} decimals={m.decimals} />
              </p>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--foreground-secondary)]">
                {m.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}