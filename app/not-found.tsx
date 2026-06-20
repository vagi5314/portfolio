import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Not found",
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-[80vh] items-center bg-ink text-bone"
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-6 py-32">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.4em] text-bone-2">
          <span>404</span>
          <span className="block h-px w-10 bg-rust" />
          <span>Lost in the seams</span>
        </div>

        <h1 className="font-display text-[18vw] leading-[0.9] tracking-[-0.04em] text-bone md:text-[12vw]">
          Page <em className="italic text-rust">not found</em>.
        </h1>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <p className="max-w-md font-body text-base leading-relaxed text-bone-2 md:col-span-7 md:text-lg">
            The page you wanted isn&apos;t here. It may have been moved, or
            you may have mistyped the URL. Either way, the home page is two
            clicks away and full of things that work.
          </p>
          <div className="md:col-span-5 md:text-right">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border-b border-rust pb-1 font-mono text-xs uppercase tracking-[0.25em] text-bone transition-colors hover:text-rust"
            >
              ← Back to the index
            </Link>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-bone-2/60">
              {SITE.author} · {SITE.location}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}