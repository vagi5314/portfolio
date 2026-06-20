"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function MagneticButtonV2({
  children,
  className,
  onClick,
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);

  // Initialise the GSAP tween writers once on mount, then reuse them on
  // every mousemove. Calling quickTo per-mousemove leaks tweens and
  // defeats the point of the cached quickTo helpers.
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    xTo.current = gsap.quickTo(btn, "x", {
      duration: 0.45,
      ease: "power2.out",
    });
    yTo.current = gsap.quickTo(btn, "y", {
      duration: 0.45,
      ease: "power2.out",
    });
    return () => {
      xTo.current = null;
      yTo.current = null;
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!btnRef.current || !xTo.current || !yTo.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 120;
    if (dist < radius) {
      const pull = (1 - dist / radius) * 0.35;
      xTo.current(dx * pull);
      yTo.current(dy * pull);
    } else {
      xTo.current(0);
      yTo.current(0);
    }
  };

  const handleMouseLeave = () => {
    if (xTo.current) xTo.current(0);
    if (yTo.current) yTo.current(0);
  };

  const handleMouseDown = () => {
    if (!btnRef.current || disabled) return;
    gsap.to(btnRef.current, {
      scale: 0.95,
      duration: 0.12,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const handleMouseUp = () => {
    if (!btnRef.current || disabled) return;
    gsap.to(btnRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
      overwrite: true,
    });
  };

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={cn(
        "relative inline-flex items-center gap-2 will-change-transform",
        className
      )}
    >
      {children}
    </button>
  );
}
