"use client";

import { useEffect } from "react";
import { CursorProvider } from "@/components/providers/cursor-provider";
import { LiquidCursor } from "@/components/liquid-cursor";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { NavRail } from "@/components/nav-rail";
import {
  ChapterCounter,
  ChapterHelp,
  KeyboardNav,
} from "@/components/chapter-counter";
import { ScrollPalette } from "@/components/scroll-palette";
import { SpotlightTracker } from "@/components/spotlight-tracker";

export function ClientShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const hover = window.matchMedia("(hover: hover)").matches;
    if (finePointer && hover) {
      document.documentElement.classList.add("has-custom-cursor");
    }
  }, []);

  return (
    <CursorProvider>
      <SpotlightTracker />
      <ScrollPalette />
      <LiquidCursor />
      <ScrollProgressBar />
      <ChapterCounter />
      <KeyboardNav />
      <ChapterHelp />
      {children}
      <NavRail />
    </CursorProvider>
  );
}