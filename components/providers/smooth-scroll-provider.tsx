"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const SCROLL_KEY = "portfolio:scroll:";

function readSavedScroll(pathname: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SCROLL_KEY + pathname);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeSavedScroll(pathname: string, y: number) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SCROLL_KEY + pathname, String(y));
  } catch {
    /* sessionStorage may be disabled — silent */
  }
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pathnameRef = useRef<string>(pathname);
  const lenisRef = useRef<Lenis | null>(null);
  const lastPathRef = useRef<string>(pathname);
  const initScrollAppliedRef = useRef(false);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lenisRef.current) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.5,
      wheelMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const coarseMql = window.matchMedia("(pointer: coarse)");
    const onCoarseChange = () => {
      if (!lenisRef.current) return;
      if (coarseMql.matches) {
        lenisRef.current.options.touchMultiplier = 1.5;
        lenisRef.current.options.duration = 1.4;
      } else {
        lenisRef.current.options.touchMultiplier = 1;
        lenisRef.current.options.duration = 1.2;
      }
    };
    coarseMql.addEventListener("change", onCoarseChange);

    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    const initPath = pathnameRef.current;
    const saved = readSavedScroll(initPath);
    if (saved !== null && saved > 0) {
      requestAnimationFrame(() => {
        lenis.scrollTo(saved, { immediate: true });
        ScrollTrigger.refresh();
      });
    } else {
      lenis.scrollTo(0, { immediate: true });
    }
    initScrollAppliedRef.current = true;

    return () => {
      writeSavedScroll(pathnameRef.current, lenis.scroll);
      coarseMql.removeEventListener("change", onCoarseChange);
      gsap.ticker.remove(tick);
      lenis.destroy();
      if ((window as unknown as { __lenis?: Lenis }).__lenis === lenis) {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
      if (lenisRef.current === lenis) {
        lenisRef.current = null;
      }
      initScrollAppliedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!lenisRef.current) return;
    if (!initScrollAppliedRef.current) return;
    if (lastPathRef.current === pathname) return;

    const prevPath = lastPathRef.current;
    lastPathRef.current = pathname;

    writeSavedScroll(prevPath, lenisRef.current.scroll);

    requestAnimationFrame(() => {
      if (!lenisRef.current) return;
      const saved = readSavedScroll(pathname);
      const target = saved !== null && saved > 0 ? saved : 0;
      lenisRef.current.scrollTo(target, { immediate: true });
      ScrollTrigger.refresh();
    });
  }, [pathname]);

  return <>{children}</>;
}