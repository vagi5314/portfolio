"use client";

import Link from "next/link";
import { forwardRef, useCallback, useRef, type ReactNode } from "react";

type WarpLinkProps = {
  href: string;
  slug?: string;
  children: ReactNode;
  className?: string;
  "data-cursor"?: string;
  "data-cursor-thumb"?: string;
  "data-cursor-label"?: string;
  "data-cursor-tag"?: string;
  "aria-label"?: string;
  viewTransitionName?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export const WarpLink = forwardRef<HTMLAnchorElement, WarpLinkProps>(
  function WarpLink(
    { href, children, onClick, viewTransitionName, style, ...rest },
    forwardedRef
  ) {
    const localRef = useRef<HTMLAnchorElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLAnchorElement | null) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLAnchorElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        onClick?.(e);
        if (e.defaultPrevented) return;

        if (localRef.current) {
          localRef.current.animate(
            [
              { transform: "scale(1)" },
              { transform: "scale(0.985)", filter: "brightness(0.92)" },
              { transform: "scale(1)" },
            ],
            { duration: 220, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
          );
        }
      },
      [onClick]
    );

    return (
      <Link
        ref={setRefs}
        href={href}
        onClick={handleClick}
        style={viewTransitionName ? { viewTransitionName, ...style } : style}
        {...rest}
      >
        {children}
      </Link>
    );
  }
);
