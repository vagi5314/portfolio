"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.error("Work page error:", error);
    }
  }, [error]);

  return (
    <main className="relative flex min-h-[80vh] items-center bg-bone text-ink">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-6 py-32">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.4em] text-ink-2">
          <span>Error</span>
          <span className="block h-px w-10 bg-rust" />
          <span>Something broke</span>
        </div>

        <h1 className="font-display text-[18vw] leading-[0.9] tracking-[-0.04em] text-ink md:text-[12vw]">
          Can&apos;t <em className="italic text-rust">load</em>.
        </h1>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <p className="max-w-md font-body text-base leading-relaxed text-ink-2 md:col-span-7 md:text-lg">
            The page hit an unexpected error. Try again, or head back to the
            index.
          </p>
          <div className="md:col-span-5 md:text-right">
            <button
              onClick={reset}
              className="mr-4 inline-flex items-center gap-2 border-b border-rust pb-1 font-mono text-xs uppercase tracking-[0.25em] text-ink transition-colors hover:text-rust"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border-b border-rust pb-1 font-mono text-xs uppercase tracking-[0.25em] text-ink transition-colors hover:text-rust"
            >
              ← Back to the index
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}