"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { projects } from "@/lib/projects";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { WarpLink } from "@/components/warp-link";
import { ImageDistortion } from "@/components/image-distortion";
import { RGBShift } from "@/components/rgb-shift";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

type Pose = {
  xPct: number;
  yPct: number;
  rot: number;
  scale: number;
  widthVw: number;
  z: number;
};

const SCATTERED: Pose[] = [
  { xPct: -26, yPct: -22, rot: -10, scale: 0.78, widthVw: 26, z: 1 },
  { xPct: 26,  yPct: -22, rot: 8,   scale: 0.74, widthVw: 24, z: 2 },
  { xPct: -24, yPct: 22,  rot: 12,  scale: 0.82, widthVw: 28, z: 3 },
  { xPct: 24,  yPct: 22,  rot: -8,  scale: 0.70, widthVw: 22, z: 4 },
];

const CIRCLE: Pose[] = [
  { xPct: 0,   yPct: -28, rot: 0,  scale: 0.72, widthVw: 22, z: 1 },
  { xPct: 28,  yPct: 0,   rot: 0,  scale: 0.72, widthVw: 22, z: 2 },
  { xPct: 0,   yPct: 28,  rot: 0,  scale: 0.72, widthVw: 22, z: 3 },
  { xPct: -28, yPct: 0,   rot: 0,  scale: 0.72, widthVw: 22, z: 4 },
];

const ARC: Pose[] = [
  { xPct: -22, yPct: 10, rot: -6,  scale: 0.84, widthVw: 28, z: 1 },
  { xPct: 22,  yPct: 10, rot: 6,   scale: 0.84, widthVw: 28, z: 2 },
  { xPct: -10, yPct: -20, rot: -3, scale: 0.92, widthVw: 32, z: 3 },
  { xPct: 10,  yPct: -20, rot: 3,  scale: 0.92, widthVw: 32, z: 4 },
];

const GRID: Pose[] = [
  { xPct: -22, yPct: -10, rot: 0, scale: 0.92, widthVw: 34, z: 1 },
  { xPct: 22,  yPct: -10, rot: 0, scale: 0.92, widthVw: 34, z: 2 },
  { xPct: -22, yPct: 14,  rot: 0, scale: 0.92, widthVw: 34, z: 3 },
  { xPct: 22,  yPct: 14,  rot: 0, scale: 0.92, widthVw: 34, z: 4 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixPose(a: Pose, b: Pose, t: number): Pose {
  return {
    xPct: lerp(a.xPct, b.xPct, t),
    yPct: lerp(a.yPct, b.yPct, t),
    rot: lerp(a.rot, b.rot, t),
    scale: lerp(a.scale, b.scale, t),
    widthVw: lerp(a.widthVw, b.widthVw, t),
    z: Math.round(lerp(a.z, b.z, t)),
  };
}

function poseAt(i: number, p: number): Pose {
  if (p < 0.33) return mixPose(SCATTERED[i], CIRCLE[i], p / 0.33);
  if (p < 0.66) return mixPose(CIRCLE[i], ARC[i], (p - 0.33) / 0.33);
  return mixPose(ARC[i], GRID[i], (p - 0.66) / 0.34);
}

function poseAtProgress(p: number): Pose[] {
  return [0, 1, 2, 3].map((i) => poseAt(i, p));
}

export function ReelSection() {
  const pinRef = useRef<HTMLElement>(null);
  const coverRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const summariesRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const setCoverRef = useCallback(
    (i: number) => (el: HTMLAnchorElement | null) => {
      coverRefs.current[i] = el;
    },
    []
  );

  useGSAP(
    () => {
      if (reduced || !pinRef.current) return;
      if (typeof window === "undefined") return;

      const covers = coverRefs.current.filter(
        (c): c is HTMLAnchorElement => c !== null
      );
      if (covers.length === 0) return;

      const pinEl = pinRef.current;
      const headerEl = pinEl.querySelector<HTMLElement>(".reel-stage-header");
      const eyebrowEl = pinEl.querySelector<HTMLElement>(".reel-eyebrow");
      const footEl = pinEl.querySelector<HTMLElement>(".reel-foot");
      const stageProgress = pinEl.querySelector<HTMLElement>(".reel-stage-progress");

      let vw = window.innerWidth;
      let vh = window.innerHeight;

      const applyPose = (i: number, pose: Pose) => {
        const c = covers[i];
        c.style.width = `${pose.widthVw}vw`;
        c.style.zIndex = String(pose.z);
        const tx = (pose.xPct * vw) / 100;
        const ty = (pose.yPct * vh) / 100;
        c.style.transform = `translate3d(calc(-50% + ${tx}px), calc(-50% + ${ty}px), 0) scale(${pose.scale}) rotate(${pose.rot}deg)`;
      };

      const applyAllPoses = (poses: Pose[]) => {
        for (let i = 0; i < covers.length; i++) applyPose(i, poses[i]);
      };

      applyAllPoses(SCATTERED);

      const st = ScrollTrigger.create({
        trigger: pinEl,
        start: "top top",
        end: "bottom bottom",
        pin: ".reel-pin",
        scrub: 0.3,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => {
          vw = window.innerWidth;
          vh = window.innerHeight;
        },
        onUpdate: (self) => {
          const p = self.progress;
          const poses = poseAtProgress(p);

          for (let i = 0; i < covers.length; i++) {
            applyPose(i, poses[i]);
          }

          if (headerEl) {
            headerEl.style.opacity = String(Math.max(0, 1 - p * 3));
          }
          if (eyebrowEl) {
            eyebrowEl.style.opacity = String(Math.max(0, 1 - p * 5));
          }
          if (footEl) {
            footEl.style.opacity = String(Math.min(1, Math.max(0, (p - 0.45) * 2)));
          }
          if (stageProgress) {
            const bar = stageProgress.querySelector<HTMLElement>(".reel-stage-bar");
            if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
          }
        },
      });

      const summariesEl = summariesRef.current;
      if (summariesEl) {
        const summaryItems = Array.from(
          summariesEl.querySelectorAll<HTMLElement>(".reel-summary-item")
        );
        const progressLabel = summariesEl.querySelector<HTMLElement>(".reel-summaries-progress");
        const n = summaryItems.length;
        if (n > 0) {
          summaryItems.forEach((item, i) => {
            const cover = item.querySelector<HTMLElement>(".reel-summary-cover > div");
            const title = item.querySelector<HTMLElement>(".reel-summary-title");
            const body = item.querySelector<HTMLElement>(".reel-summary-body");
            const stack = item.querySelector<HTMLElement>(".reel-summary-stack");
            const cta = item.querySelector<HTMLElement>(".reel-summary-cta");
            if (i === 0) {
              gsap.set(item, { opacity: 1, y: 0, pointerEvents: "auto" });
              if (cover) gsap.set(cover, { scale: 1, filter: "brightness(1)" });
              if (title) gsap.set(title, { clipPath: "inset(0 0% 0 0)", y: 0 });
              if (body) gsap.set(body, { y: 0, opacity: 1 });
              if (stack) gsap.set(stack.children, { y: 0, opacity: 1 });
              if (cta) gsap.set(cta, { y: 0, opacity: 1 });
            } else {
              gsap.set(item, { opacity: 0, y: 60, pointerEvents: "none" });
              if (cover) gsap.set(cover, { scale: 0.92, filter: "brightness(0.6)" });
              if (title) gsap.set(title, { clipPath: "inset(0 100% 0 0)", y: 24 });
              if (body) gsap.set(body, { y: 16, opacity: 0 });
              if (stack) gsap.set(stack.children, { y: 12, opacity: 0 });
              if (cta) gsap.set(cta, { y: 12, opacity: 0 });
            }
          });

          const seg = 1 / n;
          const fadeDur = 0.3 * seg;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: summariesEl,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.8,
              anticipatePin: 1,
            },
          });

          summaryItems.forEach((item, i) => {
            if (i === 0) return;
            const tIn = i * seg;
            const cover = item.querySelector<HTMLElement>(".reel-summary-cover > div");
            const title = item.querySelector<HTMLElement>(".reel-summary-title");
            const body = item.querySelector<HTMLElement>(".reel-summary-body");
            const stack = item.querySelector<HTMLElement>(".reel-summary-stack");
            const cta = item.querySelector<HTMLElement>(".reel-summary-cta");

            tl.to(
              item,
              { opacity: 1, y: 0, duration: fadeDur, ease: "power2.out" },
              tIn
            );
            tl.set(item, { pointerEvents: "auto" }, tIn);
            if (cover) {
              tl.to(
                cover,
                { scale: 1, filter: "brightness(1)", duration: fadeDur, ease: "power2.out" },
                tIn
              );
            }
            if (title) {
              tl.to(
                title,
                { clipPath: "inset(0 0% 0 0)", y: 0, duration: fadeDur, ease: "power3.out" },
                tIn
              );
            }
            if (body) {
              tl.to(
                body,
                { y: 0, opacity: 1, duration: fadeDur, ease: "power2.out" },
                tIn
              );
            }
            if (stack) {
              tl.to(
                stack.children,
                { y: 0, opacity: 1, duration: fadeDur, ease: "power2.out", stagger: 0.02 },
                tIn
              );
            }
            if (cta) {
              tl.to(
                cta,
                { y: 0, opacity: 1, duration: fadeDur, ease: "power2.out" },
                tIn
              );
            }
          });

          summaryItems.forEach((item, i) => {
            if (i === n - 1) return;
            const tOut = (i + 1) * seg - fadeDur;
            tl.to(
              item,
              { opacity: 0, y: -40, duration: fadeDur, ease: "power2.in" },
              tOut
            );
            tl.set(item, { pointerEvents: "none" }, tOut);
          });

          if (progressLabel) {
            tl.to(
              progressLabel,
              {
                onUpdate: function () {
                  const p = this.progress();
                  const idx = Math.min(n, Math.max(1, Math.floor(p * n) + 1));
                  progressLabel.textContent = `${idx.toString().padStart(2, "0")} / ${n
                    .toString()
                    .padStart(2, "0")}`;
                },
              },
              0
            );
          }
        }
      }

      return () => {
        st.kill();
      };
    },
    { scope: pinRef }
  );

  return (
    <>
      <section
        ref={pinRef}
        id="work"
        className="relative h-auto md:[height:500vh]"
      >
        <div
          className="reel-pin sticky top-0 h-screen w-full overflow-hidden bg-ink"
          style={{
            zIndex: "var(--z-section-pin)",
            isolation: "isolate",
          } as React.CSSProperties}
        >
          <div className="reel-eyebrow pointer-events-none absolute left-0 right-0 top-0 z-10 mx-auto w-full max-w-[1400px] px-6 pt-12 font-mono text-xs uppercase tracking-[0.25em] text-bone-2 md:flex md:justify-end md:pr-[calc(var(--nav-rail-safe)+1.5rem)]">
            <span>{projects.length.toString().padStart(2, "0")} projects</span>
          </div>

          <div className="reel-stage-header absolute inset-0 z-0 flex items-end px-6 pb-24 md:items-center md:justify-center md:pb-0">
            <div className="mx-auto w-full max-w-5xl text-center">
              <h2 className="font-[family-name:var(--font-instrument-serif)] text-4xl font-normal leading-[1.05] tracking-[-0.01em] text-bone text-balance md:text-7xl">
                Selected work, with{" "}
                <em className="italic text-rust">receipts</em>.
              </h2>
            </div>
          </div>

          {projects.map((p, i) => {
            return (
              <WarpLink
                key={p.slug}
                href={`/work/${p.slug}`}
                ref={setCoverRef(i)}
                data-cursor="project"
                data-cursor-thumb={p.thumb}
                data-cursor-label={p.title}
                data-cursor-tag={p.tag}
                data-project-slug={p.slug}
                className={cn(
                  "reel-cover absolute left-1/2 top-1/2 block overflow-hidden border border-bone/10 bg-ink-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] will-change-transform"
                )}
                style={{
                  aspectRatio: "16 / 10",
                  transform: "translate3d(0,0,0)",
                  backfaceVisibility: "hidden",
                }}
                viewTransitionName={`cs-${p.slug}`}
                aria-label={`Open case study: ${p.title}`}
              >
                <div
                  className="reel-cover-inner absolute inset-0 overflow-hidden"
                  style={{ position: "absolute" }}
                >
                  <ImageDistortion className="h-full w-full">
                    <RGBShift className="h-full w-full">
                      <Image
                        src={p.cover}
                        alt={`${p.title} cover`}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </RGBShift>
                  </ImageDistortion>
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-bone/5" />
                  <div className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/5" />
                </div>
                <span
                  className={cn(
                    "reel-cover-tag absolute left-3 top-3 z-10 rounded-full bg-ink/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-bone backdrop-blur-sm sm:text-xs"
                  )}
                >
                  {(i + 1).toString().padStart(2, "0")} · {p.tag}
                </span>
              </WarpLink>
            );
          })}

          <div
            className="reel-foot pointer-events-none absolute inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[1400px] px-6 pb-12"
            style={{ opacity: 0 }}
          >
            <div className="reel-stage-progress mb-3 h-px w-full bg-bone/10">
              <div
                className="reel-stage-bar h-full w-full origin-left bg-rust"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-bone-2/80">
              <span>Cover morph</span>
              <span>scatter → circle → arc → grid</span>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={summariesRef}
        id="work-summaries"
        className="relative bg-ink h-auto md:[height:1000vh]"
      >
        <div
          className="reel-pin sticky top-0 flex h-screen w-full items-center overflow-hidden bg-ink"
          style={{
            zIndex: "var(--z-section-pin)",
            isolation: "isolate",
          } as React.CSSProperties}
        >
          <div className="pointer-events-none absolute left-6 right-6 top-12 z-10 flex items-baseline justify-between font-mono text-xs uppercase tracking-[0.25em] text-bone-2 md:right-[calc(var(--nav-rail-safe)+1.5rem)]">
            <span>The four that <em className="italic text-rust">made the cut</em></span>
            <span>{projects.length.toString().padStart(2, "0")} projects · 2026</span>
          </div>

          <div className="reel-summary-track relative mx-auto h-full w-full max-w-[1400px]">
            {projects.map((p, i) => (
              <article
                key={p.slug}
                className="reel-summary-item absolute inset-0 flex flex-col justify-center px-6 md:px-12"
                data-i={i}
                aria-hidden={i !== 0}
              >
                <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
                  <div className="md:col-span-7">
                    <div className="mb-6 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.32em] text-bone-2">
                      <span className="font-display text-5xl font-light tracking-[-0.02em] text-rust md:text-6xl">
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="block h-px flex-1 bg-bone/15" />
                      <span>{p.tag}</span>
                      <span className="text-bone-2/60">·</span>
                      <span>{p.year}</span>
                    </div>

                    <h3 className="reel-summary-title font-[family-name:var(--font-instrument-serif)] text-[clamp(2.5rem,8vw,7.5rem)] font-normal leading-[0.95] tracking-normal text-bone text-balance">
                      {p.title}
                    </h3>

                    <p className="reel-summary-body mt-12 max-w-2xl font-mono text-sm leading-[1.7] text-bone-2 text-pretty md:text-base md:mt-14">
                      {p.summary}
                    </p>

                    <ul className="reel-summary-stack mt-10 flex flex-wrap gap-2">
                      {p.stack.map((s) => (
                        <li
                          key={s}
                          className="inline-flex items-center rounded-full border border-bone/15 px-3 py-1 font-mono text-xs text-bone-2"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>

                    <WarpLink
                      href={`/work/${p.slug}`}
                      data-cursor="project"
                      data-cursor-thumb={p.thumb}
                      data-cursor-label={p.title}
                      data-cursor-tag={p.tag}
                      data-project-slug={p.slug}
                      className="reel-summary-cta mt-10 inline-flex items-center gap-2 self-start border-b border-rust pb-1 font-mono text-xs uppercase tracking-[0.25em] text-bone transition-colors hover:text-rust"
                      viewTransitionName={`cs-${p.slug}`}
                    >
                      Read case study
                      <ArrowUpRight size={14} strokeWidth={1.5} />
                    </WarpLink>
                  </div>

                  <div className="md:col-span-5">
                    <WarpLink
                      href={`/work/${p.slug}`}
                      data-cursor="project"
                      data-cursor-thumb={p.thumb}
                      data-cursor-label={p.title}
                      data-cursor-tag={p.tag}
                      data-project-slug={p.slug}
                      className="reel-summary-cover group block"
                      viewTransitionName={`cs-${p.slug}`}
                      aria-label={`Open case study: ${p.title}`}
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden border border-bone/10 bg-ink-2">
                        <Image
                          src={p.cover}
                          alt={`${p.title} cover`}
                          fill
                          sizes="(min-width: 768px) 40vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 ring-1 ring-bone/5" />
                      </div>
                    </WarpLink>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-8 left-6 right-6 z-10 flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-bone-2 md:right-[calc(var(--nav-rail-safe)+1.5rem)]">
            <span>Scroll to read</span>
            <span className="reel-summaries-progress" />
          </div>
        </div>
      </section>
    </>
  );
}