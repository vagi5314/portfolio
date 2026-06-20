"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { MagneticButtonV2 } from "@/components/magnetic-button-v2";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { SITE } from "@/lib/site";

const WORDMARK_LINES = ["Modelling", "the seams", "of data."] as const;

export function FilmRollHero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      if (typeof window === "undefined") return;

      const section = ref.current;
      if (!section) return;

      let cancelled = false;

      const waitForPreloader = (): Promise<void> => {
        if ((window as { __preloaderDone?: boolean }).__preloaderDone) {
          return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
          const onDone = () => {
            window.removeEventListener("portfolio:preloader-done", onDone);
            resolve();
          };
          window.addEventListener("portfolio:preloader-done", onDone);
        });
      };

      let cleanup: (() => void) | null = null;

      const start = () => {
        if (cancelled) return;

        const intro = gsap.timeline({ delay: 0.3 });
        intro.from(".hero-eyebrow", {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.out",
        });
        intro.from(
          ".hero-line",
          {
            opacity: 0,
            y: 30,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
          },
          "-=0.4"
        );
        intro.from(
          ".hero-meta",
          {
            opacity: 0,
            y: 12,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.06,
          },
          "-=0.5"
        );
        intro.from(
          ".hero-cta",
          { opacity: 0, y: 16, duration: 0.5, ease: "power2.out" },
          "-=0.4"
        );
        intro.from(
          ".hero-scroll-hint",
          { opacity: 0, y: 8, duration: 0.35, ease: "power2.out" },
          "-=0.25"
        );

        if (cancelled) {
          intro.kill();
          return;
        }

        // Cache the elements we touch in onUpdate. Querying on every
        // scrub tick is a 60Hz DOM cost we can avoid by snapshotting
        // once at the start of the animation.
        const wordmark = section.querySelector<HTMLElement>(".hero-wordmark");
        const metaFade = section.querySelector<HTMLElement>(".hero-meta-fade");

        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const st = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
            onUpdate: (self) => {
              const p = self.progress;
              // Route scroll-driven motion through gsap.set so the
              // matrix is composited with the mouse-driven quickTo on
              // the same element. Writing el.style.transform would
              // clobber GSAP's transform and cause a one-frame flicker
              // on every mouse move.
              if (wordmark) {
                gsap.set(wordmark, {
                  opacity: Math.max(0, 1 - p * 1.5),
                  y: p * 80,
                });
              }
              if (metaFade) {
                gsap.set(metaFade, { opacity: Math.max(0, 1 - p * 2) });
              }
            },
          });
          return () => st.kill();
        });

        const parallaxBg = section.querySelector<HTMLElement>(".hero-parallax-bg");
        const parallaxWordmark = section.querySelector<HTMLElement>(".hero-parallax-wordmark");
        const parallaxMeta = section.querySelector<HTMLElement>(".hero-meta-fade");

        let removeMouseMove: (() => void) | undefined;

        if (parallaxBg && parallaxWordmark && parallaxMeta) {
          const bgX = gsap.quickTo(parallaxBg, "x", { duration: 1.2, ease: "power3.out" });
          const bgY = gsap.quickTo(parallaxBg, "y", { duration: 1.2, ease: "power3.out" });

          const wordmarkX = gsap.quickTo(parallaxWordmark, "x", { duration: 0.8, ease: "power3.out" });
          const wordmarkY = gsap.quickTo(parallaxWordmark, "y", { duration: 0.8, ease: "power3.out" });

          const metaX = gsap.quickTo(parallaxMeta, "x", { duration: 1.0, ease: "power3.out" });
          const metaY = gsap.quickTo(parallaxMeta, "y", { duration: 1.0, ease: "power3.out" });

          const onMouseMove = (e: MouseEvent) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;

            bgX(dx * -14);
            bgY(dy * -14);
            wordmarkX(dx * 10);
            wordmarkY(dy * 10);
            metaX(dx * 6);
            metaY(dy * 6);
          };

          window.addEventListener("mousemove", onMouseMove, { passive: true });
          removeMouseMove = () => window.removeEventListener("mousemove", onMouseMove);
        }

        cleanup = () => {
          mm.revert();
          if (removeMouseMove) removeMouseMove();
          intro.kill();
        };
      };

      waitForPreloader().then(() => {
        // Abort cleanly if the component unmounted before the preloader
        // fired. Without this guard, a fast nav away + back could leave
        // a dead intro timeline with listeners still attached.
        if (cancelled) return;
        start();
      });

      return () => {
        cancelled = true;
        if (cleanup) cleanup();
      };
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      id="hero"
      className="relative h-screen w-full overflow-hidden"
    >
      <div className="hero-parallax-bg absolute -inset-[5%] will-change-transform">
        <div
          aria-hidden
          className="absolute inset-0 will-change-transform"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 30%, rgba(232, 90, 43, 0.18) 0%, transparent 55%), radial-gradient(90% 70% at 80% 80%, rgba(232, 90, 43, 0.08) 0%, transparent 60%), linear-gradient(180deg, var(--color-ink) 0%, var(--color-ink-2) 100%)",
          }}
        />
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-[0.04] mix-blend-overlay"
        >
          <filter id="hero-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-grain)" />
        </svg>
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-[1400px] flex-col justify-between px-6 pt-24 pb-12 pointer-events-none">
        <div className="hero-eyebrow relative z-20 flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-bone-2 md:pr-[var(--nav-rail-safe)]">
          <span>{SITE.author} · Data Science &amp; n8n</span>
          <span>{SITE.location} · 2026</span>
        </div>

        <div className="hero-parallax-wordmark absolute inset-x-0 top-[18vh] z-[2] flex items-start justify-center md:top-[22vh] will-change-transform pointer-events-auto">
          <h1 className="hero-wordmark font-[family-name:var(--font-instrument-serif)] text-[clamp(3rem,9.5vw,9.5rem)] font-normal leading-[0.95] tracking-[-0.045em] text-center text-bone will-change-transform">
            {WORDMARK_LINES.map((line, i) => (
              <span
                key={i}
                className="hero-line block"
                style={{
                  fontStyle: i === 1 ? "italic" : "normal",
                  color: i === 1 ? "var(--color-bone-2)" : undefined,
                }}
              >
                {line}
              </span>
            ))}
          </h1>
        </div>

        <div className="hero-meta-fade relative z-10 grid grid-cols-1 gap-8 pb-8 md:grid-cols-12 md:items-end md:pr-[var(--nav-rail-safe)] will-change-transform pointer-events-auto">
          <div className="hero-meta col-span-1 flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.2em] text-bone-2 md:col-span-5">
            <span>Now</span>
            <span className="text-bone">Open to final-year roles</span>
            <span>{SITE.location}</span>
          </div>
          <div className="hero-cta col-span-1 flex flex-wrap items-center gap-3 md:col-span-7 md:justify-end">
            <MagneticButtonV2
              className="h-11 rounded-full bg-rust px-5 text-bone transition-colors hover:bg-bone hover:text-ink"
              onClick={() => {
                const el = document.getElementById("work");
                if (el && window.__lenis) {
                  window.__lenis.scrollTo(el, { offset: -24 });
                } else {
                  el?.scrollIntoView({ behavior: "auto", block: "start" });
                }
              }}
            >
              See the work
              <ArrowDown size={14} strokeWidth={1.5} />
            </MagneticButtonV2>
            <MagneticButtonV2
              className="h-11 rounded-full border border-bone/20 px-5 text-bone transition-colors hover:border-rust hover:text-rust"
              onClick={() => {
                const el = document.getElementById("contact");
                if (el && window.__lenis) {
                  window.__lenis.scrollTo(el, { offset: -24 });
                } else {
                  el?.scrollIntoView({ behavior: "auto", block: "start" });
                }
              }}
            >
              Get in touch
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </MagneticButtonV2>
          </div>
        </div>
      </div>

      <div className="hero-scroll-hint pointer-events-none absolute bottom-8 inset-x-0 z-10 mx-auto flex items-center justify-center font-mono text-xs uppercase tracking-[0.25em] text-bone-2">
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}