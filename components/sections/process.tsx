"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const steps = [
  {
    n: "01",
    title: "Read the data first.",
    body: "Spend a week on the rows before writing a model. Distributions, missingness, leakage, label noise. The wrong dataset costs more than the wrong algorithm — and the cost shows up in week three, not week one.",
  },
  {
    n: "02",
    title: "Build the smallest model that ships.",
    body: "Baseline first. Then a better model. Then a serving artifact. Real data, real metrics, real endpoints. The notebook is for thinking — production is for proving it works when you are not watching.",
  },
  {
    n: "03",
    title: "Make the reasoning visible.",
    body: "SHAP, partial dependence, feature importance, calibration plots. A score without an explanation is a coin flip with extra steps. Operators need to know why the model fired before they trust it enough to act.",
  },
  {
    n: "04",
    title: "Ship the pipeline, not the notebook.",
    body: "Done is a model that runs on a schedule, survives a missing row, and wakes you up when it breaks. n8n in the middle means retries, alerts, and fallbacks are part of the system — not bolted on after the demo.",
  },
];

export function Process() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      if (typeof window === "undefined") return;

      const section = ref.current;
      if (!section) return;

      const cards = section.querySelectorAll<HTMLElement>(".process-card");
      if (!cards.length) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card, i) => {
          const num = card.querySelector<HTMLElement>(".process-num");
          const title = card.querySelector<HTMLElement>(".process-title");
          const body = card.querySelector<HTMLElement>(".process-body");
          const rule = card.querySelector<HTMLElement>(".process-rule");
          if (!num || !title || !body || !rule) return;

          if (i === 0) {
            gsap.set(rule, { scaleX: 1, transformOrigin: "left center" });
            gsap.set([num, body], { opacity: 1, y: 0 });
            gsap.set(title, { clipPath: "inset(0 0% 0 0)" });
          } else {
            gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
            gsap.set([num, body], { opacity: 0, y: 12 });
            gsap.set(title, { clipPath: "inset(0 100% 0 0)" });
          }
        });

        const progressLine = section.querySelector<HTMLElement>(".process-progress-line");
        if (progressLine) {
          gsap.set(progressLine, { scaleY: 0, transformOrigin: "top center" });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=400%",
            pin: ".process-pin",
            scrub: 0.5,
            anticipatePin: 1,
          },
        });

        if (progressLine) {
          tl.to(progressLine, { scaleY: 1, ease: "none" }, 0);
        }

        cards.forEach((card, i) => {
          if (i === 0) return;
          const num = card.querySelector<HTMLElement>(".process-num");
          const title = card.querySelector<HTMLElement>(".process-title");
          const body = card.querySelector<HTMLElement>(".process-body");
          const rule = card.querySelector<HTMLElement>(".process-rule");
          if (!num || !title || !body || !rule) return;
          const t = i;

          tl.to(
            rule,
            { scaleX: 1, duration: 0.3, ease: "power3.out" },
            t
          );
          tl.to(
            [num, body],
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
            t + 0.05
          );
          tl.to(
            title,
            { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: "power3.out" },
            t + 0.05
          );
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      id="process"
      className="bg-ink"
      style={{ height: "500vh" }}
    >
      <div className="process-pin sticky top-0 h-screen w-full overflow-hidden bg-ink" style={{ zIndex: 'var(--z-section-pin)' } as React.CSSProperties}>
        <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col px-6 py-10">
          <div className="mb-6 flex items-baseline justify-end font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)] md:pr-[var(--nav-rail-safe)]">
            <span>Scroll to read · 4 steps</span>
          </div>

          {/* Progress line */}
          <div className="absolute left-6 top-24 bottom-12 hidden w-px bg-bone/10 md:block">
            <div className="process-progress-line absolute inset-0 w-full h-full bg-rust origin-top scale-y-0" />
          </div>

          <h2 className="mb-8 font-[family-name:var(--font-instrument-serif)] text-3xl leading-[1.05] tracking-[-0.01em] text-bone text-balance md:text-5xl">
            How I work, in <em className="italic text-rust">four steps</em>.
          </h2>

          <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {steps.map((step) => (
              <article
                key={step.n}
                className="process-card group relative flex flex-col gap-3 border-t border-bone/10 pt-5"
              >
                <div className="process-rule absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-rust" />

                <div className="flex items-baseline gap-4">
                  <div className="process-num font-display text-3xl font-light leading-none tracking-[-0.02em] text-bone-2/40 md:text-5xl">
                    {step.n}
                  </div>
                  <h3 className="process-title flex-1 font-display text-xl font-light leading-[1.1] tracking-[-0.02em] text-bone text-balance md:text-3xl">
                    {step.title}
                  </h3>
                </div>

                <p className="process-body max-w-3xl font-mono text-sm leading-relaxed text-bone-2 text-pretty">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
