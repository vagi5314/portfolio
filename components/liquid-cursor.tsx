"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { useCursor } from "@/components/providers/cursor-provider";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const RING = 36;
const DOT = 6;
const PROJECT = 240;

interface HoverInfo {
  slug: string;
  src: string;
  label: string;
  tag: string;
}

const IDLE_HIDE_MS = 1500;
const FADE_MS = 320;

export function LiquidCursor() {
  const { state, hidden } = useCursor();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);

  const stateRef = useRef(state);
  const hoverRef = useRef(hover);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  useGSAP(
    () => {
      if (reduced || hidden) return;
      const handleOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target?.closest) return;
        const el = target.closest<HTMLElement>('[data-cursor="project"]');
        if (!el) return;
        const src = el.dataset.cursorThumb || "";
        const slug = el.dataset.projectSlug || "";
        if (!src || !slug) return;
        setHover((prev) => {
          if (prev && prev.slug === slug) return prev;
          return {
            slug,
            src,
            label: el.dataset.cursorLabel || "",
            tag: el.dataset.cursorTag || "",
          };
        });
      };
      const handleOut = (e: MouseEvent) => {
        const related = e.relatedTarget as HTMLElement | null;
        if (!related?.closest) {
          setHover(null);
          return;
        }
        const nextProject = related.closest<HTMLElement>('[data-cursor="project"]');
        if (!nextProject) {
          setHover(null);
          return;
        }
        const nextSlug = nextProject.dataset.projectSlug || "";
        setHover((prev) => (prev && prev.slug === nextSlug ? prev : null));
      };
      document.addEventListener("mouseover", handleOver);
      document.addEventListener("mouseout", handleOut);
      const handleLeave = () => setHover(null);
      window.addEventListener("blur", handleLeave);
      document.addEventListener("mouseleave", handleLeave);
      return () => {
        document.removeEventListener("mouseover", handleOver);
        document.removeEventListener("mouseout", handleOut);
        window.removeEventListener("blur", handleLeave);
        document.removeEventListener("mouseleave", handleLeave);
      };
    },
    { scope: rootRef, dependencies: [reduced, hidden] }
  );

  useGSAP(
    () => {
      if (reduced || hidden) return;
      if (!ringRef.current || !dotRef.current || !glowRef.current) return;

      // Anchor every cursor layer at (0, 0); translate it with the cursor
      // and use transform-origin: center so the visual center stays on
      // the pointer regardless of the animated width/height.
      const setBase = (el: HTMLElement) => {
        el.style.position = "fixed";
        el.style.left = "0";
        el.style.top = "0";
        el.style.transformOrigin = "center";
        el.style.willChange = "transform";
        el.style.pointerEvents = "none";
      };
      [ringRef.current, dotRef.current, glowRef.current].forEach(setBase);

      // The offset we subtract per-element: half of its visual size so the
      // center lines up with the cursor. We read the live computed size to
      // stay correct during morphs between RING / link / text / project.
      const ringXTo = gsap.quickTo(ringRef.current, "x", {
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
      const ringYTo = gsap.quickTo(ringRef.current, "y", {
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
      const dotXTo = gsap.quickTo(dotRef.current, "x", {
        duration: 0.12,
        ease: "power3.out",
        overwrite: "auto",
      });
      const dotYTo = gsap.quickTo(dotRef.current, "y", {
        duration: 0.12,
        ease: "power3.out",
        overwrite: "auto",
      });
      const glowXTo = gsap.quickTo(glowRef.current, "x", {
        duration: 1.1,
        ease: "power3.out",
        overwrite: "auto",
      });
      const glowYTo = gsap.quickTo(glowRef.current, "y", {
        duration: 1.1,
        ease: "power3.out",
        overwrite: "auto",
      });

      // Idle fade: if the pointer doesn't move for IDLE_HIDE_MS, fade the
      // cursor so it doesn't sit centered over text while the user scrolls
      // via keyboard / trackpad / wheel. Movement brings it back instantly.
      let idleTimer: number | null = null;
      let lastX = -1;
      let lastY = -1;
      const armIdle = () => {
        if (idleTimer) window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => {
          gsap.to([ringRef.current, dotRef.current, glowRef.current].filter(Boolean), {
            opacity: 0,
            duration: FADE_MS / 1000,
            ease: "power2.out",
            overwrite: "auto",
          });
        }, IDLE_HIDE_MS);
      };
      const wake = () => {
        if (idleTimer) {
          window.clearTimeout(idleTimer);
          idleTimer = null;
        }
        gsap.to([ringRef.current, dotRef.current, glowRef.current].filter(Boolean), {
          opacity: 1,
          duration: FADE_MS / 1000,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const onMove = (e: MouseEvent) => {
        const ring = ringRef.current;
        const glow = glowRef.current;
        if (!ring || !glow) return;
        const isProject = stateRef.current === "project" && hoverRef.current;
        const ringSize = isProject
          ? PROJECT
          : ring.offsetWidth || RING;
        const dotSize = DOT;
        const glowSize = glow.offsetWidth || 300;

        ringXTo(e.clientX - ringSize / 2);
        ringYTo(e.clientY - ringSize / 2);
        dotXTo(e.clientX - dotSize / 2);
        dotYTo(e.clientY - dotSize / 2);
        glowXTo(e.clientX - glowSize / 2);
        glowYTo(e.clientY - glowSize / 2);

        if (e.clientX !== lastX || e.clientY !== lastY) {
          lastX = e.clientX;
          lastY = e.clientY;
          wake();
        }
        armIdle();
      };

      const onLeave = () => {
        if (idleTimer) {
          window.clearTimeout(idleTimer);
          idleTimer = null;
        }
        gsap.to([ringRef.current, dotRef.current, glowRef.current].filter(Boolean), {
          opacity: 0,
          duration: FADE_MS / 1000,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const onEnter = () => wake();

      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
      document.addEventListener("mouseenter", onEnter);
      armIdle();

      return () => {
        if (idleTimer) window.clearTimeout(idleTimer);
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseleave", onLeave);
        document.removeEventListener("mouseenter", onEnter);
      };
    },
    { scope: rootRef, dependencies: [reduced, hidden] }
  );

  useEffect(() => {
    if (reduced || hidden || !ringRef.current) return;
    if (state === "project" && hover) {
      gsap.to(ringRef.current, {
        width: PROJECT,
        height: PROJECT,
        borderRadius: 4,
        backgroundColor: "rgba(14, 14, 16, 0.92)",
        borderColor: "rgba(232, 90, 43, 0.4)",
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
    } else if (state === "link") {
      gsap.to(ringRef.current, {
        width: RING * 1.4,
        height: RING * 1.4,
        borderRadius: 999,
        backgroundColor: "rgba(242, 237, 228, 0.95)",
        borderColor: "rgba(242, 237, 228, 0)",
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
    } else if (state === "text") {
      gsap.to(ringRef.current, {
        width: 4,
        height: 56,
        borderRadius: 2,
        backgroundColor: "rgba(232, 90, 43, 1)",
        borderColor: "rgba(232, 90, 43, 0)",
        duration: 0.3,
        ease: "power3.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(ringRef.current, {
        width: RING,
        height: RING,
        borderRadius: 999,
        backgroundColor: "rgba(0, 0, 0, 0)",
        borderColor: "rgba(242, 237, 228, 0.8)",
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }, [state, hover, reduced, hidden]);

  useEffect(() => {
    if (reduced || hidden || !dotRef.current) return;
    gsap.to(dotRef.current, {
      opacity: state === "project" && hover ? 0 : 1,
      duration: 0.25,
      ease: "power2.out",
    });
  }, [state, hover, reduced, hidden]);

  useEffect(() => {
    if (reduced || hidden || !ringRef.current) return;
    const onDown = () => gsap.to(ringRef.current, { scale: 0.9, duration: 0.15 });
    const onUp = () => gsap.to(ringRef.current, { scale: 1, duration: 0.25 });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [reduced, hidden]);

  if (reduced || hidden) return null;

  const showProject = state === "project" && hover;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: "var(--z-cursor)" } as React.CSSProperties}
    >
      <div
        ref={glowRef}
        className="rounded-full"
        style={{
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, rgba(242,237,228,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        ref={dotRef}
        className="rounded-full"
        style={{ width: DOT, height: DOT, backgroundColor: "var(--cursor-color, var(--color-bone))" }}
      />
      <div
        ref={ringRef}
        className={cn(
          "flex items-center justify-center overflow-hidden border will-change-transform"
        )}
        style={{
          width: RING,
          height: RING,
          borderRadius: 999,
          borderColor: "var(--cursor-color, var(--color-bone))",
        }}
      >
        {showProject && hover ? (
          <div className="relative h-full w-full">
            <Image
              src={hover.src}
              alt={hover.label}
              fill
              sizes="240px"
              unoptimized
              className="object-cover"
              draggable={false}
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-bone drop-shadow">
                {hover.label}
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-bone/70 drop-shadow">
                {hover.tag}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
