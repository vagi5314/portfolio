"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface Palette {
  bg: string;
  fg: string;
  fg2: string;
  surface: string;
  accent: string;
}

const DARK: Palette = {
  bg: "oklch(0.16 0.005 60)",
  fg: "oklch(0.94 0.018 80)",
  fg2: "oklch(0.88 0.018 80)",
  surface: "oklch(0.20 0.005 60)",
  accent: "oklch(0.66 0.19 40)",
};

const LIGHT: Palette = {
  bg: "oklch(0.94 0.018 80)",
  fg: "oklch(0.16 0.005 60)",
  fg2: "oklch(0.34 0.008 60)",
  surface: "oklch(0.88 0.018 80)",
  accent: "oklch(0.55 0.20 35)",
};

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function parseOklch(input: string): [number, number, number] {
  const m = input.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) return [0, 0, 0];
  return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
}

function oklch(l: number, c: number, h: number): string {
  return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`;
}

function mixPalettes(a: Palette, b: Palette, t: number): Palette {
  const out: Palette = { bg: "", fg: "", fg2: "", surface: "", accent: "" };
  (Object.keys(a) as (keyof Palette)[]).forEach((k) => {
    const [al, ac, ah] = parseOklch(a[k]);
    const [bl, bc, bh] = parseOklch(b[k]);
    let h: number;
    if (Math.abs(ah - bh) > 180) {
      const bh2 = bh < ah ? bh + 360 : bh - 360;
      h = ((mix(ah, bh2, t) + 360) % 360);
    } else {
      h = mix(ah, bh, t);
    }
    out[k] = oklch(mix(al, bl, t), mix(ac, bc, t), h);
  });
  return out;
}

function applyPalette(html: HTMLElement, p: Palette) {
  html.style.setProperty("--background", p.bg);
  html.style.setProperty("--foreground", p.fg);
  html.style.setProperty("--foreground-secondary", p.fg2);
  html.style.setProperty("--surface", p.surface);
  html.style.setProperty("--accent", p.accent);
  html.style.setProperty(
    "--hairline",
    `color-mix(in oklch, ${p.fg} 12%, transparent)`
  );
  const bgLightness = parseOklch(p.bg)[0];
  // Cursor: high-contrast foreground that always reads against the
  // current palette. Dark sections get the bright foreground, light
  // sections get the foreground at ~55% so it doesn't blow out.
  const fgL = parseOklch(p.fg)[0];
  const cursorColor =
    bgLightness > 0.5
      ? `oklch(${Math.max(0.12, fgL * 0.55)} 0 0)`
      : p.fg;
  const cursorFill =
    bgLightness > 0.5
      ? p.fg
      : `color-mix(in oklch, ${p.fg} 92%, transparent)`;
  html.style.setProperty("--cursor-color", cursorColor);
  html.style.setProperty("--cursor-fill", cursorFill);
}

const START = 0.55;
const END = 0.85;

function getMix(p: number): Palette {
  if (p <= START) return DARK;
  if (p >= END) return LIGHT;
  const t = (p - START) / (END - START);
  return mixPalettes(DARK, LIGHT, t);
}

export function ScrollPalette() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    applyPalette(html, DARK);

    if (!isHome) return;

    let raf = 0;
    let currentT = 0;
    let lastT = -1;

    const update = () => {
      raf = 0;
      // Skip work when the interpolated t hasn't moved enough to be
      // visually distinguishable. Threshold is well under one hue unit
      // and tiny in lightness, so the perceived transition is identical
      // but we cut ~80% of the per-frame setProperty calls.
      if (Math.abs(currentT - lastT) < 0.004) return;
      lastT = currentT;
      if (reduce) {
        applyPalette(html, currentT > 0.7 ? LIGHT : DARK);
        return;
      }
      applyPalette(html, getMix(currentT));
    };

    const setProgress = (p: number) => {
      currentT = p;
      if (!raf) raf = requestAnimationFrame(update);
    };

    const l = (window as unknown as { __lenis?: { on: (e: string, fn: (s: { progress: number }) => void) => void; off: (e: string, fn: (s: { progress: number }) => void) => void } }).__lenis;
    if (l) {
      const onLenis = (s: { progress: number }) => setProgress(s.progress);
      l.on("scroll", onLenis);
      setProgress(0);
      return () => {
        l.off("scroll", onLenis);
        if (raf) cancelAnimationFrame(raf);
        applyPalette(html, DARK);
      };
    }

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight || 1;
      setProgress(Math.min(1, Math.max(0, window.scrollY / h)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      applyPalette(html, DARK);
    };
  }, [isHome]);

  return null;
}