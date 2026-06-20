"use client";

import { useRef } from "react";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { SITE } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const section = ref.current;
      if (!section) return;

      // Per-line reveal for headline
      const headline = section.querySelector(".footer-headline");
      if (headline) {
        const lines = headline.querySelectorAll(".headline-line");
        gsap.fromTo(
          lines,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: headline,
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // Stagger reveal for links
      const links = section.querySelectorAll(".footer-link");
      gsap.fromTo(
        links,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section.querySelector(".footer-links"),
            start: "top 90%",
            once: true,
          },
        }
      );

      // SVG mark draw
      const mark = section.querySelectorAll<SVGPathElement>(".footer-mark");
      if (mark.length) {
        mark.forEach((p) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
        });
        gsap.to(mark, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: section.querySelector(".footer-mark-svg"),
            start: "top 90%",
            once: true,
          },
        });
      }
    },
    { scope: ref }
  );

  const backToTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { offset: 0, force: true, immediate: false });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      ref={ref}
      id="site-footer"
      className="relative border-t py-16 pb-24 md:py-24 md:pb-32 content-lazy"
      style={{ borderColor: "var(--hairline)", background: "var(--background)", zIndex: 'var(--z-overlay)' } as React.CSSProperties}
    >
      <div className="mx-auto w-full max-w-[1400px] px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <p className="footer-headline font-[family-name:var(--font-instrument-serif)] text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[var(--foreground)] text-balance md:text-7xl">
              <span className="headline-line block"><em className="italic text-rust-2">Thanks</em> for scrolling all</span>
              <span className="headline-line block">the way down here.</span>
              <span className="headline-line block">Let&apos;s make the next one together.</span>
            </p>

            {/* Single-letter mark, hand-drawn */}
            <svg
              viewBox="0 0 80 80"
              className="footer-mark-svg mt-10 h-12 w-12 text-[var(--foreground)] md:h-14 md:w-14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Mark"
            >
              {/* V */}
              <path className="footer-mark" d="M14 18 L40 64 L66 18" />
            </svg>
          </div>

          <div className="footer-links md:col-span-3">            <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)]">
              Elsewhere
            </p>
            <ul className="flex flex-col items-start space-y-1.5 font-mono text-sm text-[var(--foreground)]">
              <li className="footer-link">
                <a
                  data-cursor="link"
                  href={SITE.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 transition-colors hover:text-[var(--accent)]"
                >
                  GitHub
                  <ArrowUpRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </li>
              <li className="footer-link">
                <a
                  data-cursor="link"
                  href={`mailto:${SITE.email}`}
                  className="group inline-flex items-center gap-1 transition-colors hover:text-[var(--accent)]"
                >
                  Email
                  <ArrowUpRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </li>
              <li className="footer-link">
                <a
                  data-cursor="link"
                  href={SITE.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 transition-colors hover:text-[var(--accent)]"
                >
                  LinkedIn
                  <ArrowUpRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)]">
            <p>© {year} · {SITE.author}</p>
            <p className="mt-1">{SITE.location}</p>
            <p className="mt-3 text-[var(--foreground)]">{SITE.author} — Data Science · n8n</p>
            <p className="mt-1">Built with Next.js · GSAP · Tailwind</p>
            <p className="mt-1">Résumé available on request</p>
            <button
              onClick={backToTop}
              data-cursor="link"
              className="mt-6 inline-flex items-center gap-2 text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
            >
              <ArrowUp size={14} strokeWidth={1.5} />
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
