"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

const FOLLOWER_SIZE = 600;

export function SpotlightTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const follower = document.createElement("div");
    follower.setAttribute("aria-hidden", "true");
    follower.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${FOLLOWER_SIZE}px;
      height: ${FOLLOWER_SIZE}px;
      pointer-events: none;
      z-index: var(--z-overlay);
      transform: translate3d(-50%, -50%, 0);
      will-change: transform;
      background: radial-gradient(
        circle,
        rgba(242, 237, 228, 0.05) 0%,
        rgba(242, 237, 228, 0.025) 35%,
        transparent 70%
      );
      mix-blend-mode: screen;
      opacity: 0;
      transition: opacity 0.4s ease;
    `;
    document.body.appendChild(follower);

    const xTo = gsap.quickTo(follower, "x", {
      duration: 0.45,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(follower, "y", {
      duration: 0.45,
      ease: "power3.out",
    });

    let frame = 0;
    let lastEvent: MouseEvent | null = null;
    const onMove = (e: MouseEvent) => {
      lastEvent = e;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!lastEvent) return;
        xTo(lastEvent.clientX);
        yTo(lastEvent.clientY);
      });
    };

    const onEnter = () => {
      gsap.to(follower, { opacity: 1, duration: 0.4, ease: "power2.out" });
    };
    const onLeave = () => {
      gsap.to(follower, { opacity: 0, duration: 0.6, ease: "power2.out" });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseenter", onEnter, { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      follower.remove();
    };
  }, []);

  return null;
}