"use client";

import { useRef, useCallback, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface RGBShiftProps {
  children: ReactNode;
  className?: string;
}

export function RGBShift({ children, className }: RGBShiftProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const handleEnter = useCallback(() => {
    if (!rootRef.current) return;
    gsap.to(rootRef.current, {
      scale: 1.015,
      duration: 0.45,
      ease: "power3.out",
    });
  }, []);

  const handleLeave = useCallback(() => {
    if (!rootRef.current) return;
    gsap.to(rootRef.current, {
      scale: 1,
      duration: 0.55,
      ease: "power3.out",
    });
  }, []);

  return (
    <div
      ref={rootRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={cn(
        "relative h-full w-full will-change-transform [transform:translateZ(0)]",
        className
      )}
    >
      {children}
    </div>
  );
}