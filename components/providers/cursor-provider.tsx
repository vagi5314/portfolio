"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

export type CursorState = "default" | "project" | "link" | "text";

interface CursorContextValue {
  state: CursorState;
  setState: (s: CursorState) => void;
  hidden: boolean;
}

const CursorContext = createContext<CursorContextValue | null>(null);

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCursor must be used within CursorProvider");
  return ctx;
}

function subscribeMedia(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const hover = window.matchMedia("(hover: none)");
  const pointer = window.matchMedia("(pointer: coarse)");
  hover.addEventListener("change", callback);
  pointer.addEventListener("change", callback);
  return () => {
    hover.removeEventListener("change", callback);
    pointer.removeEventListener("change", callback);
  };
}

function getTouchClient(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

function getTouchServer(): boolean {
  return false;
}

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CursorState>("default");
  const [overHidden, setOverHidden] = useState(false);
  const isTouch = useSyncExternalStore(
    subscribeMedia,
    getTouchClient,
    getTouchServer,
  );
  const hidden = isTouch || overHidden;

  useEffect(() => {
    if (isTouch) return;
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest) return;
      const el = target.closest<HTMLElement>("[data-cursor]");
      if (el) {
        const cursor = el.dataset.cursor as CursorState | undefined;
        if (cursor) setState(cursor);
      } else {
        setState("default");
      }
    };
    const handleOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (!related) {
        setOverHidden(false);
        return;
      }
      if (!related.closest) return;
      const enteringHidden = related.closest("[data-cursor-hidden]") !== null;
      setOverHidden(enteringHidden);
    };
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    return () => {
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, [isTouch]);

  return (
    <CursorContext.Provider
      value={{ state, setState, hidden }}
    >
      {children}
    </CursorContext.Provider>
  );
}
