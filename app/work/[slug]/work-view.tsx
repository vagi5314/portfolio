"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { WarpLink } from "@/components/warp-link";
import { subscribeLookGate } from "@/lib/look-gate";
import { cn } from "@/lib/utils";
import type { BodyBlock, Project } from "@/lib/projects";

type Props = {
  project: Project;
  next: { slug: string; title: string; cover: string; thumb: string; tag: string } | null;
  index: number;
  total: number;
};

const CHAPTERS = [
  { id: "wp-cover", label: "Cover", n: "01" },
  { id: "wp-meta", label: "Meta", n: "02" },
  { id: "wp-body", label: "Body", n: "03" },
  { id: "wp-cta", label: "Next", n: "04" },
] as const;

export function WorkView({ project, next, index, total }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [navHidden, setNavHidden] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    CHAPTERS.forEach((c, i) => {
      const el = document.getElementById(c.id);
      if (!el) return;
      const ob = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(i);
        },
        { rootMargin: "-30% 0px -30% 0px", threshold: 0 }
      );
      ob.observe(el);
      observers.push(ob);
    });

    const ctaEl = document.getElementById("wp-cta");
    let ctaOb: IntersectionObserver | null = null;
    if (ctaEl) {
      ctaOb = new IntersectionObserver(
        ([entry]) => setNavHidden(entry.isIntersecting),
        { rootMargin: "-40% 0px -10% 0px", threshold: 0 }
      );
      ctaOb.observe(ctaEl);
    }

    return () => {
      observers.forEach((o) => o.disconnect());
      ctaOb?.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      if (reduced) return;
      if (typeof window === "undefined") return;

      const root = ref.current;
      if (!root) return;

      let settled = true;
      const gateSub = subscribeLookGate((s) => {
        settled = s.isSettled;
      });

      // Parallax cover
      const coverImg = root.querySelector<HTMLElement>(".wp-cover-img");
      if (coverImg) {
        gsap.to(coverImg, {
          yPercent: 14,
          scale: 1.06,
          ease: "none",
          scrollTrigger: {
            trigger: ".wp-cover",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Color tint: rust overlay drifts opacity as cover scrolls out
      const tint = root.querySelector<HTMLElement>(".wp-cover-tint");
      if (tint) {
        gsap.fromTo(
          tint,
          { opacity: 0 },
          {
            opacity: 0.45,
            ease: "none",
            scrollTrigger: {
              trigger: ".wp-cover",
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      // Title scroll-tied: animate container with translateY (single composite)
      // rather than per-character transforms (O(n) per frame).
      const titleWrap = root.querySelector<HTMLElement>(".wp-title-wave");
      const titleST = ScrollTrigger.create({
        trigger: ".wp-cover",
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
        onUpdate: (self) => {
          if (!settled) return;
          const p = self.progress;
          if (titleWrap) {
            const y = Math.sin(p * Math.PI * 2) * 12;
            const rot = Math.sin(p * Math.PI * 2) * 1.4;
            titleWrap.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
          }
          const wordmark = root.querySelector<HTMLElement>(".wp-title");
          if (wordmark) {
            const op = p < 0.7 ? 1 : Math.max(0, 1 - (p - 0.7) * 4);
            wordmark.style.setProperty("opacity", String(op));
          }
        },
      });

      // Stagger image reveals with alternating masks
      const figs = root.querySelectorAll<HTMLElement>(".wp-block-image");
      const imageMasks: Array<{ mask: HTMLElement; observer: IntersectionObserver }> = [];
      figs.forEach((fig, i) => {
        const mask = fig.querySelector<HTMLElement>(".wp-mask");
        if (!mask) return;
        const dir = i % 4;
        const startClip = (() => {
          switch (dir) {
            case 0:
              return "inset(0 100% 0 0)";
            case 1:
              return "inset(0 0 0 100%)";
            case 2:
              return "inset(100% 0 0 0)";
            case 3:
              return "inset(0 100% 0 0)";
          }
        })();

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            gsap.fromTo(
              mask,
              { clipPath: startClip },
              {
                clipPath: "inset(0 0% 0 0%)",
                duration: 1.2,
                ease: "power3.out",
              }
            );
            observer.disconnect();
          },
          { threshold: 0.22 }
        );
        observer.observe(fig);
        imageMasks.push({ mask, observer });
      });

      // H2 + p stagger on body — set initial state only when ScrollTrigger
      // is in a state that will animate them. We add a fallback in case
      // a scroll-restore mount leaves the trigger already past start.
      const blocks = Array.from(
        root.querySelectorAll<HTMLElement>(
          ".wp-block-h2, .wp-block-p, .wp-block-quote, .wp-block-metrics, .wp-block-code"
        )
      );

      const blockTriggers: ScrollTrigger[] = [];
      blocks.forEach((b) => {
        const trigger = ScrollTrigger.create({
          trigger: b,
          start: "top 92%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              b,
              { y: 24, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.9,
                ease: "power2.out",
              }
            );
          },
        });
        blockTriggers.push(trigger);
      });

      // Reveal-all fallback: if a block is already in view at mount
      // (back-nav with restored scroll, hash anchor, or fast jump),
      // force it visible. ScrollTrigger can miss these on cold load.
      const blockFallback = window.setTimeout(() => {
        blocks.forEach((b) => {
          const rect = b.getBoundingClientRect();
          const vh = window.innerHeight || 1;
          if (rect.top < vh && rect.bottom > 0) {
            gsap.set(b, { y: 0, opacity: 1, clearProps: "transform" });
          }
        });
      }, 250);

      const imageFallback = window.setTimeout(() => {
        imageMasks.forEach(({ mask, observer }) => {
          const current = getComputedStyle(mask).clipPath;
          if (current && current !== "inset(0 0% 0 0%)" && current !== "none") {
            mask.style.clipPath = "inset(0 0% 0 0%)";
          }
          observer.disconnect();
        });
      }, 600);

      return () => {
        titleST.kill();
        gateSub();
        window.clearTimeout(imageFallback);
        window.clearTimeout(blockFallback);
        blockTriggers.forEach((t) => t.kill());
        imageMasks.forEach(({ observer }) => observer.disconnect());
      };
    },
    { scope: ref }
  );

  return (
    <main ref={ref} id="main-content" className="relative min-h-screen bg-bone text-ink">
      <MiniNav active={active} hidden={navHidden} title={project.title} />

      <header className="relative z-20 pt-32 md:pt-40">
        <div className="mx-auto w-full max-w-[1400px] px-6">
          <div className="mb-8 flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-ink-2">
            <WarpLink
              href="/"
              data-cursor="link"
              className="inline-flex items-center gap-2 transition-colors hover:text-rust"
            >
              <span aria-hidden>←</span> Index
            </WarpLink>
            <span>
              {(index + 1).toString().padStart(2, "0")} / {total
                .toString()
                .padStart(2, "0")}
            </span>
          </div>

          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ink-2">
            {project.tag} · {project.role} · {project.year}
          </p>
        </div>
      </header>

      <section
        id="wp-cover"
        className="wp-cover relative aspect-[16/8] w-full overflow-hidden bg-ink-2 md:aspect-[16/7]"
      >
        <div
          className="wp-cover-img"
          style={{
            position: "absolute",
            inset: 0,
            viewTransitionName: `cs-${project.slug}`,
          }}
        >
          <Image
            src={project.cover}
            alt={`${project.title} cover`}
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="wp-cover-tint absolute inset-0 bg-ink/40 mix-blend-multiply" />

        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-10 md:pb-14">
          <div className="mx-auto w-full max-w-[1400px]">
            <h1 className="wp-title font-display text-[clamp(2.5rem,8vw,8rem)] font-light leading-[0.95] tracking-[-0.04em] text-bone text-balance">
              <span className="wp-title-wave inline-block will-change-transform">
                {project.title}
              </span>
            </h1>
          </div>
        </div>

        <ScrollHint />
      </section>

      <section
        id="wp-meta"
        className="border-b border-ink/10 py-14 md:py-20"
      >
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-10 px-6 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ink-2">
              Stack
            </p>
            <ul className="flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-xs text-ink">
              {project.stack.map((s, i) => (
                <li key={s} className="inline-flex items-center">
                  {s}
                  {i < project.stack.length - 1 && (
                    <span className="ml-3 text-ink-2/50" aria-hidden>
                      /
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-5">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ink-2">
              Summary
            </p>
            <p className="font-display text-2xl leading-snug tracking-[-0.01em] text-ink text-balance md:text-3xl">
              {project.summary}
            </p>
          </div>

          {(project.live || project.github) && (
            <div className="md:col-span-2">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ink-2">
                View
              </p>
              <ul className="flex flex-col gap-2 font-mono text-xs">
                {project.live && (
                  <li>
                    <a
                      data-cursor="link"
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-ink transition-colors hover:text-rust"
                    >
                      Live
                      <ArrowUpRight
                        size={12}
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  </li>
                )}
                {project.github && (
                  <li>
                    <a
                      data-cursor="link"
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-ink transition-colors hover:text-rust"
                    >
                      Source
                      <ArrowUpRight
                        size={12}
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8 md:col-span-12 md:mt-2 md:grid-cols-3 md:gap-10">
            {project.metrics.map((m) => (
              <div key={m.label} className="border-t border-ink/15 pt-4">
                <p className="font-display text-4xl leading-none tracking-[-0.02em] text-ink md:text-5xl">
                  {m.value}
                </p>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-2">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="wp-body" className="py-16 md:py-24">
        <div className="mx-auto w-full max-w-[820px] px-6">
          {project.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>
      </section>

      <section
        id="wp-cta"
        className="wp-cta relative overflow-hidden border-t border-ink/15 bg-ink py-20 text-bone md:py-28"
      >
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <WarpLink
              href="/"
              data-cursor="link"
              className="font-mono text-xs uppercase tracking-[0.25em] text-bone-2 transition-colors hover:text-rust"
            >
              ← Back to all work
            </WarpLink>
            <WarpLink
              href="/#contact"
              data-cursor="link"
              className="font-mono text-xs uppercase tracking-[0.25em] text-bone-2 transition-colors hover:text-rust"
            >
              Want one like this? Let&apos;s chat →
            </WarpLink>
          </div>

          {next && (
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-bone-2">
                Next project
              </p>
              <WarpLink
                href={`/work/${next.slug}`}
                viewTransitionName={`cs-${next.slug}`}
                data-cursor="project"
                data-cursor-thumb={next.thumb}
                data-cursor-label={next.title}
                data-cursor-tag={next.tag}
                className="group block"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
                  <div className="md:col-span-8">
                    <h2 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.03em] text-bone transition-colors group-hover:text-rust md:text-[clamp(3rem,9vw,8rem)]">
                      {next.title}
                    </h2>
                  </div>
                  <div className="md:col-span-4">
                    <div
                      className="relative aspect-[16/10] w-full overflow-hidden bg-ink-2"
                      style={{ position: "relative" }}
                    >
                      <Image
                        src={next.cover}
                        alt={`${next.title} cover`}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-bone-2">
                      {next.tag} →
                    </p>
                  </div>
                </div>
              </WarpLink>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ScrollHint() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center md:bottom-8"
    >
      <span className="inline-flex h-8 w-5 items-start justify-center rounded-full border border-bone/30 p-1">
        <span className="block h-1.5 w-px animate-scroll-wheel bg-bone/70" />
      </span>
    </div>
  );
}

function Block({ block }: { block: BodyBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="wp-block-h2 mb-6 mt-16 font-display text-3xl leading-tight tracking-[-0.02em] text-ink md:text-4xl">
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p className="wp-block-p mb-6 font-body text-lg leading-[1.7] text-ink/85">
          {block.text}
        </p>
      );
    case "image":
      return (
        <figure className="wp-block-image my-10">
          <div
            className="wp-mask relative aspect-[16/9] w-full overflow-hidden bg-ink-2"
            style={{ position: "relative" }}
          >
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(min-width: 768px) 820px, 100vw"
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-2">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "code":
      return (
        <pre className="wp-block-code my-10 overflow-x-auto border-l-2 border-rust bg-ink-2 p-5 font-mono text-sm leading-relaxed text-bone">
          <code>{block.code}</code>
        </pre>
      );
    case "metrics":
      return (
        <div className="wp-block-metrics my-10 grid grid-cols-1 gap-4 border-y border-ink/15 py-6 sm:grid-cols-3">
          {block.items.map((m) => (
            <div key={m.label}>
              <p className="font-display text-3xl tracking-[-0.02em] text-ink">
                {m.value}
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-ink-2">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      );
    case "quote":
      return (
        <blockquote className="wp-block-quote my-12 border-l-2 border-rust pl-6">
          <p className="font-display text-2xl leading-snug italic text-ink md:text-3xl">
            &ldquo;{block.text}&rdquo;
          </p>
          {block.attribution && (
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-2">
              {block.attribution}
            </p>
          )}
        </blockquote>
      );
  }
}

function MiniNav({
  active,
  hidden,
  title,
}: {
  active: number;
  hidden: boolean;
  title: string;
}) {
  return (
    <nav
      data-cursor-hidden
      aria-label="Project chapters"
      className={cn(
        "fixed right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-4 transition-opacity duration-300 md:flex",
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      )}
      style={{ zIndex: "var(--z-nav-rail)" } as React.CSSProperties}
    >
      <div className="mb-2 max-w-[180px] text-right font-display text-sm leading-tight tracking-[-0.01em] text-ink">
        {title}
      </div>
      <div className="flex flex-col items-end gap-3 border-r border-ink/15 pr-3">
        {CHAPTERS.map((c, i) => {
          const isActive = active === i;
          return (
            <a
              key={c.id}
              href={`#${c.id}`}
              className={cn(
                "group/dot flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] transition-colors",
                isActive ? "text-rust" : "text-ink-2 hover:text-ink"
              )}
            >
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "max-w-[120px] opacity-100"
                    : "max-w-0 opacity-0 group-hover/dot:max-w-[120px] group-hover/dot:opacity-100"
                )}
              >
                {c.n} · {c.label}
              </span>
              <span
                className={cn(
                  "block h-1.5 w-1.5 rounded-full border transition-all",
                  isActive
                    ? "border-rust bg-rust"
                    : "border-ink-2/40 group-hover/dot:border-ink"
                )}
              />
            </a>
          );
        })}
      </div>
    </nav>
  );
}
