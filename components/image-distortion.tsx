"use client";

import { useRef, useState, useCallback, useId, useEffect, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface ImageDistortionProps {
  children: ReactNode;
  className?: string;
}

function getCanHover(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(hover: hover)").matches;
}

export function ImageDistortion({ children, className }: ImageDistortionProps) {
  const filterId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<SVGFilterElement>(null);
  const [active, setActive] = useState(false);
  const canHoverRef = useRef(true);

  useEffect(() => {
    canHoverRef.current = getCanHover();
  }, []);

  const canHover = canHoverRef.current;

  const handleMouseEnter = useCallback(() => {
    if (!canHover) return;
    setActive(true);
    if (!filterRef.current) return;
    const turb = filterRef.current.querySelector("feTurbulence");
    if (!turb) return;
    gsap.to(turb, {
      attr: { baseFrequency: "0.03 0.03" },
      duration: 0.4,
      ease: "power2.out",
    });
  }, [canHover]);

  const handleMouseLeave = useCallback(() => {
    if (!canHover) return;
    if (!filterRef.current) return;
    const turb = filterRef.current.querySelector("feTurbulence");
    if (!turb) return;
    gsap.to(turb, {
      attr: { baseFrequency: "0.01 0.01" },
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => setActive(false),
    });
  }, [canHover]);

  return (
    <div
      ref={wrapperRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg className="absolute size-0" aria-hidden>
        <defs>
          <filter
            ref={filterRef}
            id={`distort${filterId}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.01"
              numOctaves="2"
              seed="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="14"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div
        className="relative h-full w-full"
        style={active ? { filter: `url(#distort${filterId})` } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
