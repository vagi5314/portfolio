"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SESSION_KEY = "portfolio:preloader-shown";
const TOTAL_MS = 2500;
const FADE_MS = 600;
const MAX_LIFETIME_MS = TOTAL_MS + 1500;

function readSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSession() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* sessionStorage may be disabled */
  }
}

function signalDone() {
  if (typeof window === "undefined") return;
  (window as { __preloaderDone?: boolean }).__preloaderDone = true;
  window.dispatchEvent(new Event("portfolio:preloader-done"));
}

export function CinematicPreloader() {
  // Start with `null` so we never render the preloader on the server and
  // never paint it on the client before we've checked sessionStorage /
  // reduced-motion. Resolves to a boolean on the first effect.
  const [visible, setVisible] = useState<boolean | null>(null);
  const [count, setCount] = useState(5);
  const [exiting, setExiting] = useState(false);
  const startMsRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const finishTimerRef = useRef<number>(0);
  const guardTimerRef = useRef<number>(0);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const alreadyShown = readSession();

    if (reduceMotion || alreadyShown) {
      // Never show. Signal done immediately so the hero can start.
      signalDone();
      // Defer the state update to the next microtask so this effect
      // doesn't trigger a cascading-render lint error. The component
      // re-renders with visible=false on the next tick and returns null.
      queueMicrotask(() => setVisible(false));
      return;
    }

    // Mark the session up front so a hard refresh during the animation
    // doesn't re-trigger the preloader.
    writeSession();

    const top = topBarRef.current;
    const bottom = bottomBarRef.current;
    if (top) top.style.transformOrigin = "top";
    if (bottom) bottom.style.transformOrigin = "bottom";

    if (top && bottom) {
      top.animate(
        [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
        { duration: TOTAL_MS * 0.2, fill: "forwards" }
      );
      bottom.animate(
        [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
        { duration: TOTAL_MS * 0.2, fill: "forwards" }
      );
    }

    queueMicrotask(() => setVisible(true));
    startMsRef.current = performance.now();

    // Countdown ticker — one rAF loop, writes textContent directly.
    // This avoids a React re-render per tick and survives background
    // tab throttling because rAF runs whenever the frame paints.
    const tick = () => {
      if (!startMsRef.current) return;
      const elapsed = performance.now() - startMsRef.current;
      if (elapsed >= TOTAL_MS) {
        if (top && bottom) {
          top.animate(
            [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
            { duration: FADE_MS, fill: "forwards" }
          );
          bottom.animate(
            [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
            { duration: FADE_MS, fill: "forwards" }
          );
        }
        setExiting(true);
        window.setTimeout(() => {
          signalDone();
          setVisible(false);
        }, FADE_MS);
        return;
      }
      const next = Math.max(0, 5 - Math.floor((elapsed / TOTAL_MS) * 5));
      setCount((prev) => (prev === next ? prev : next));
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);

    const finish = () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      if (finishTimerRef.current) {
        window.clearTimeout(finishTimerRef.current);
        finishTimerRef.current = 0;
      }
      if (guardTimerRef.current) {
        window.clearTimeout(guardTimerRef.current);
        guardTimerRef.current = 0;
      }
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer, {
        capture: true,
      } as AddEventListenerOptions);
      if (top && bottom) {
        top.animate(
          [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
          { duration: FADE_MS, fill: "forwards" }
        );
        bottom.animate(
          [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
          { duration: FADE_MS, fill: "forwards" }
        );
      }
      setExiting(true);
      window.setTimeout(() => {
        signalDone();
        setVisible(false);
      }, FADE_MS);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finish();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest?.("[data-preloader-root]")) {
        return;
      }
      finish();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer, {
      capture: true,
    });

    // Hard guard: even if everything else fails (hydration throw, RAF
    // starved, event listener dead), this guarantees the preloader
    // disappears after MAX_LIFETIME_MS.
    guardTimerRef.current = window.setTimeout(finish, MAX_LIFETIME_MS);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      if (finishTimerRef.current) {
        window.clearTimeout(finishTimerRef.current);
        finishTimerRef.current = 0;
      }
      if (guardTimerRef.current) {
        window.clearTimeout(guardTimerRef.current);
        guardTimerRef.current = 0;
      }
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer, {
        capture: true,
      } as AddEventListenerOptions);
    };
  }, []);

  // Don't render on SSR or before the first effect runs.
  if (visible === null) return null;
  // After finish() we set visible=false; until then keep the overlay
  // mounted so the fade-out animation has a DOM to play on.
  if (visible === false) return null;

  const handleSkip = () => {
    writeSession();
    const top = topBarRef.current;
    const bottom = bottomBarRef.current;
    if (top && bottom) {
      top.animate(
        [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
        { duration: FADE_MS, fill: "forwards" }
      );
      bottom.animate(
        [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
        { duration: FADE_MS, fill: "forwards" }
      );
    }
    setExiting(true);
    window.setTimeout(() => {
      signalDone();
      setVisible(false);
    }, FADE_MS);
  };

  return (
    <div
      data-preloader-root
      role="button"
      tabIndex={0}
      aria-label="Skip preloader"
      onClick={handleSkip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
          e.preventDefault();
          handleSkip();
        }
      }}
      className={cn(
        "fixed inset-0 grid place-items-center bg-ink will-change-[opacity,backdrop-filter]",
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      )}
      style={{
        zIndex: "var(--z-preloader)",
        transitionProperty: "opacity",
        transitionDuration: `${FADE_MS}ms`,
        transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
      } as React.CSSProperties}
    >
      <div
        ref={topBarRef}
        aria-hidden
        className="absolute left-0 right-0 top-0 h-[12vh] bg-black"
      />
      <div
        ref={bottomBarRef}
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-[12vh] bg-black"
      />

      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 200 200"
          className="h-40 w-40 md:h-56 md:w-56"
          fill="none"
        >
          <circle
            cx="100"
            cy="100"
            r="96"
            stroke="currentColor"
            strokeWidth="2"
            className="text-bone/10"
          />
          <circle
            cx="100"
            cy="100"
            r="96"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="603"
            strokeDashoffset={603 - (603 * (5 - count)) / 5}
            className="text-rust"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center",
              transition: "stroke-dashoffset 120ms linear",
            }}
          />
        </svg>
        <span className="absolute font-display text-6xl font-light text-bone md:text-8xl">
          {count}
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-[14vh] left-6 right-6 flex justify-between font-mono text-xs uppercase tracking-[0.25em] text-bone-2">
        <span>Portfolio</span>
        <span>Press Esc or click to skip</span>
      </div>
    </div>
  );
}
