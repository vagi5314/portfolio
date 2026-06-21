"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

const skillGroups = [
  { label: "Languages", items: ["Python", "SQL"] },
  { label: "Data", items: ["Pandas", "NumPy", "PyArrow", "SciPy"] },
  {
    label: "ML",
    items: ["scikit-learn", "LightGBM", "XGBoost", "SHAP", "Statsmodels"],
  },
  { label: "Visualization", items: ["Matplotlib", "Seaborn", "Plotly", "Streamlit"] },
  {
    label: "Workflow",
    items: ["n8n", "FastAPI", "Docker", "Git", "GitHub Actions", "MongoDB"],
  },
];

export function About() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || typeof window === "undefined") return;

      const section = ref.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const tween = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=500%",
            pin: ".about-pin",
            scrub: 0,
            invalidateOnRefresh: true,
          },
        });

        const panels = gsap.utils.toArray<HTMLElement>(".about-panel", track);
        const inners = panels
          .map((p) => p.querySelector<HTMLElement>(".about-panel-inner"))
          .filter((el): el is HTMLElement => el !== null);
        const corners = panels
          .map((p) => p.querySelector<HTMLElement>(".about-panel-corner"))
          .filter((el): el is HTMLElement => el !== null);

        const lastInnerOp = new Float32Array(inners.length);
        const lastCornerOp = new Float32Array(corners.length);

        const totalDistance = () =>
          window.innerWidth * Math.max(0, panels.length - 1);

        const setOp = (el: HTMLElement, slot: Float32Array, i: number, v: number) => {
          if (Math.abs(slot[i] - v) < 0.01) return;
          slot[i] = v;
          gsap.set(el, { opacity: v });
        };

        inners.forEach((el) => {
          el.style.opacity = "0";
          el.style.willChange = "opacity";
        });
        corners.forEach((el) => {
          el.style.opacity = "0";
          el.style.willChange = "opacity";
        });

        const updatePanelOpacities = () => {
          const p = tween.progress();
          const stride = window.innerWidth;
          const offset = p * totalDistance();
          const slotHalf = 0.5 * stride;
          const fadeWindow = 0.15 * stride;
          for (let i = 0; i < panels.length; i++) {
            const dist = Math.abs(offset - i * stride);
            let op: number;
            if (dist < slotHalf - fadeWindow) {
              op = 1;
            } else if (dist > slotHalf + fadeWindow) {
              op = 0;
            } else {
              op = 1 - (dist - (slotHalf - fadeWindow)) / (2 * fadeWindow);
            }
            if (inners[i]) setOp(inners[i], lastInnerOp, i, op);
            if (corners[i]) setOp(corners[i], lastCornerOp, i, op);
          }
        };

        tween.eventCallback("onUpdate", updatePanelOpacities);
        updatePanelOpacities();

        return () => {
          tween.eventCallback("onUpdate", null);
          tween.kill();
        };
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
      id="about"
      className="relative bg-ink md:[height:600vh]"
    >
      <div
        className="about-pin sticky top-0 hidden h-screen w-full overflow-hidden bg-ink md:block"
        style={{ zIndex: "var(--z-section-pin)" } as React.CSSProperties}
      >
        <div className="absolute left-6 top-12 right-6 z-10 flex items-baseline justify-end font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)] md:right-[calc(var(--nav-rail-safe)+1.5rem)]">
          <span>Scroll horizontally · 4 panels</span>
        </div>

        <div
          ref={trackRef}
          className="flex h-full w-max will-change-transform"
        >
          <Panel index={1} total={4}>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-bone-2/70">
              01 / 04
            </p>
            <h2 className="mt-8 font-[family-name:var(--font-instrument-serif)] text-[clamp(3rem,9vw,8rem)] font-normal leading-[1.0] tracking-[-0.02em] text-bone text-balance">
              I model the{" "}
              <em className="italic text-rust">seams</em> of data.
            </h2>
            <div className="mt-12 grid max-w-md grid-cols-[auto_1fr] gap-x-4 font-mono text-sm leading-[1.7] text-bone-2 text-pretty">
              <span aria-hidden className="font-[family-name:var(--font-instrument-serif)] text-5xl leading-none text-rust">
                M
              </span>
              <p>
                odels with receipts. Pipelines that ship. n8n
                automations that actually fire when the trigger does.
              </p>
            </div>
          </Panel>

          <Panel index={2} total={4} variant="ink-2">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-bone-2/70">
              02 / 04 · Who
            </p>
            <p className="mt-8 max-w-2xl font-[family-name:var(--font-instrument-serif)] text-2xl leading-[1.4] tracking-[-0.01em] text-bone text-balance md:text-4xl">
              I&apos;m a <em className="italic text-rust">data scientist</em>.
              I ship ML models, data pipelines, and{" "}
              <em className="italic text-rust">n8n</em> orchestrations —
              <em className="italic text-rust"> 4</em> shipped projects,
              <em className="italic text-rust"> 5.8M</em> rows in production.
            </p>
            <div className="mt-12 max-w-md font-mono text-sm leading-relaxed text-bone-2/80 text-pretty">
              The data is the work. The dashboards inside the case studies are just how the results land.
            </div>
          </Panel>

          <Panel index={3} total={4}>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-bone-2/70">
              03 / 04 · Stack
            </p>
            <h3 className="mt-8 font-[family-name:var(--font-instrument-serif)] text-3xl font-normal leading-[1.05] tracking-[-0.01em] text-bone md:text-5xl">
              A data-science stack, plus <em className="italic text-rust">n8n</em>.
            </h3>
            <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
              {skillGroups.map((group) => (
                <div key={group.label}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="h-px w-4 bg-bone/30" />
                    <span className="font-mono text-xs uppercase tracking-[0.22em] text-bone-2">
                      {group.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item, i) => (
                      <span
                        key={`${group.label}-${item}-${i}`}
                        className="inline-block rounded-full border border-bone/15 px-3 py-1 font-mono text-xs text-bone-2"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel index={4} total={4} variant="rust">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-bone/80">
              04 / 04 · Now
            </p>
            <h3 className="mt-8 font-[family-name:var(--font-instrument-serif)] text-[clamp(2.5rem,7vw,6rem)] font-normal leading-[0.95] tracking-[-0.02em] text-bone text-balance">
              Open to final-year{" "}
              <em className="italic">roles</em> in 2026.
            </h3>
            <div className="mt-12 space-y-3 font-mono text-sm leading-relaxed text-bone">
              <p>Data science · ML engineering · n8n orchestration.</p>
              <p>Small teams, hard data, shipped artifacts.</p>
              <p>{SITE.location} · open to remote.</p>
            </div>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-12 inline-flex h-12 items-center gap-3 border-b border-bone/50 pb-1 font-display text-2xl text-bone transition-colors hover:border-bone"
            >
              {SITE.email} →
            </a>
          </Panel>
        </div>
      </div>

      <div className="block bg-ink md:hidden">
        <div className="px-6 pb-8 pt-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-2/70">
            About · 4 panels
          </p>
        </div>

        <div className="flex flex-col">
          <Panel index={1} total={4}>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-bone-2/70">
              01 / 04
            </p>
            <h2 className="mt-6 font-[family-name:var(--font-instrument-serif)] text-5xl font-normal leading-[1.0] tracking-[-0.02em] text-bone text-balance">
              I model the{" "}
              <em className="italic text-rust">seams</em> of data.
            </h2>
            <div className="mt-10 grid max-w-md grid-cols-[auto_1fr] gap-x-4 font-mono text-sm leading-[1.7] text-bone-2 text-pretty">
              <span aria-hidden className="font-[family-name:var(--font-instrument-serif)] text-4xl leading-none text-rust">
                M
              </span>
              <p>
                odels with receipts. Pipelines that ship. n8n
                automations that actually fire when the trigger does.
              </p>
            </div>
          </Panel>

          <Panel index={2} total={4} variant="ink-2">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-bone-2/70">
              02 / 04 · Who
            </p>
            <p className="mt-6 max-w-2xl font-[family-name:var(--font-instrument-serif)] text-2xl leading-[1.4] tracking-[-0.01em] text-bone text-balance">
              I&apos;m a <em className="italic text-rust">data scientist</em>.
              I ship ML models, data pipelines, and{" "}
              <em className="italic text-rust">n8n</em> orchestrations —
              <em className="italic text-rust"> 4</em> shipped projects,
              <em className="italic text-rust"> 5.8M</em> rows in production.
            </p>
            <div className="mt-10 max-w-md font-mono text-sm leading-relaxed text-bone-2/80 text-pretty">
              The data is the work. The dashboards inside the case studies are just how the results land.
            </div>
          </Panel>

          <Panel index={3} total={4}>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-bone-2/70">
              03 / 04 · Stack
            </p>
            <h3 className="mt-6 font-[family-name:var(--font-instrument-serif)] text-3xl font-normal leading-[1.05] tracking-[-0.01em] text-bone">
              A data-science stack, plus <em className="italic text-rust">n8n</em>.
            </h3>
            <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6">
              {skillGroups.map((group) => (
                <div key={group.label}>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="h-px w-4 bg-bone/30" />
                    <span className="font-mono text-xs uppercase tracking-[0.22em] text-bone-2">
                      {group.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item, i) => (
                      <span
                        key={`${group.label}-${item}-${i}`}
                        className="inline-block rounded-full border border-bone/15 px-3 py-1 font-mono text-xs text-bone-2"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel index={4} total={4} variant="rust">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-bone/80">
              04 / 04 · Now
            </p>
            <h3 className="mt-6 font-[family-name:var(--font-instrument-serif)] text-4xl font-normal leading-[0.95] tracking-[-0.02em] text-bone text-balance">
              Open to final-year{" "}
              <em className="italic">roles</em> in 2026.
            </h3>
            <div className="mt-10 space-y-3 font-mono text-sm leading-relaxed text-bone">
              <p>Data science · ML engineering · n8n orchestration.</p>
              <p>Small teams, hard data, shipped artifacts.</p>
              <p>{SITE.location} · open to remote.</p>
            </div>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-10 inline-flex h-12 items-center gap-3 border-b border-bone/50 pb-1 font-display text-xl text-bone"
            >
              {SITE.email} →
            </a>
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Panel({
  index,
  total,
  children,
  variant = "ink",
}: {
  index: number;
  total: number;
  children: React.ReactNode;
  variant?: "ink" | "ink-2" | "rust";
}) {
  return (
    <article
      className={cn(
        "about-panel relative flex w-full shrink-0 flex-col justify-center px-6 py-16 md:h-screen md:w-screen md:px-24 md:py-0 md:pr-[calc(var(--nav-rail-safe)+3rem)]",
        variant === "ink" && "bg-ink text-bone",
        variant === "ink-2" && "bg-ink-2 text-bone",
        variant === "rust" && "text-bone"
      )}
      style={
        variant === "rust"
          ? { backgroundColor: "var(--color-rust-3)" }
          : undefined
      }
    >
      <div className="about-panel-inner mx-auto w-full max-w-5xl">
        {children}
      </div>
      <div className="about-panel-corner mt-12 font-mono text-xs uppercase tracking-[0.32em] text-bone-2/70 md:absolute md:bottom-12 md:left-24 md:mt-0">
        Panel {index.toString().padStart(2, "0")} / {total.toString().padStart(2, "0")}
      </div>
    </article>
  );
}
