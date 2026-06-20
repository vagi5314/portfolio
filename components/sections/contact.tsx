"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MagneticButtonV2 } from "@/components/magnetic-button-v2";
import { LocalTime } from "@/components/local-time";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { Mail, ArrowUpRight, Check, Loader2 } from "lucide-react";

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.21 24 24 23.23 24 22.28V1.72C24 .77 23.21 0 22.22 0Z" />
    </svg>
  );
}

const EMAIL = SITE.email;
const MIN_SUBMIT_MS = 2500;
const SUBMIT_TIMEOUT_MS = 10000;

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const tsRef = useRef<number>(0);
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const section = ref.current;
      if (!section) return;

      const headline = section.querySelector(".contact-headline");
      if (headline) {
        const lines = headline.querySelectorAll(".headline-line");
        gsap.fromTo(
          lines,
          { y: 50, opacity: 0, rotateX: 15 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: headline,
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      const formElements = section.querySelectorAll(".form-element");
      gsap.fromTo(
        formElements,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section.querySelector("form"),
            start: "top 85%",
            once: true,
          },
        }
      );

      const sidebarItems = section.querySelectorAll(".sidebar-item");
      gsap.fromTo(
        sidebarItems,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: section.querySelector(".contact-sidebar"),
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: ref }
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const elapsed = Date.now() - tsRef.current;
    if (tsRef.current > 0 && elapsed < MIN_SUBMIT_MS) {
      setStatus("error");
      return;
    }

    const data = new FormData(form);
    const honey = data.get("_honey");
    if (honey) {
      setStatus("sent");
      form.reset();
      return;
    }

    setStatus("sending");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
    try {
      const res = await fetch(
        `https://formsubmit.co/ajax/${EMAIL}`,
        {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      if (res.ok) {
        setStatus("sent");
        form.reset();
        tsRef.current = 0;
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
      }
    } catch {
      clearTimeout(timeout);
      setStatus("error");
    }
  };

  return (
    <section
      ref={ref}
      id="contact"
      className="relative border-t py-(--spacing-section)"
      style={{ borderColor: "var(--hairline)", background: "var(--background)", zIndex: 'var(--z-overlay)' } as React.CSSProperties}
    >
      <div className="mx-auto w-full max-w-[1400px] px-6">
        <div className="mb-16 flex items-baseline justify-end font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)] md:pr-[var(--nav-rail-safe)]">
          <span>Reply within 48 hours</span>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="contact-headline font-[family-name:var(--font-instrument-serif)] text-5xl leading-[1.05] tracking-[-0.02em] text-[var(--foreground)] text-balance md:text-7xl" style={{ perspective: "1000px" }}>
              <span className="headline-line block">Have a <em className="italic text-[var(--accent)]">role</em> or a brief?</span>
              <span className="headline-line block">Send the details.</span>
            </h2>

            <form
              ref={formRef}
              onSubmit={onSubmit}
              onFocus={() => {
                if (tsRef.current === 0) tsRef.current = Date.now();
              }}
              className="mt-12 space-y-4"
              noValidate
            >
              <input
                type="text"
                name="_honey"
                aria-hidden="true"
                tabIndex={-1}
                autoComplete="off"
                className="absolute h-0 w-0 opacity-0 pointer-events-none"
              />
              <div className="form-element grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block" htmlFor="contact-name">
                  <span className="mb-1 block font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)]">
                    Name
                  </span>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className="w-full border-b bg-transparent py-2 font-mono text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                    style={{ borderColor: "color-mix(in oklch, var(--foreground) 20%, transparent)" }}
                  />
                </label>
                <label className="block" htmlFor="contact-email">
                  <span className="mb-1 block font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)]">
                    Email
                  </span>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    className="w-full border-b bg-transparent py-2 font-mono text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                    style={{ borderColor: "color-mix(in oklch, var(--foreground) 20%, transparent)" }}
                  />
                </label>
              </div>
              <label className="form-element block" htmlFor="contact-message">
                <span className="mb-1 flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)]">
                  <span>Message</span>
                  <span className="text-[var(--foreground-secondary)]/60 normal-case tracking-normal">
                    2000 chars max
                  </span>
                </span>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  maxLength={2000}
                  aria-describedby="contact-message-counter"
                  className="w-full resize-none border-b bg-transparent py-2 font-mono text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                  style={{ borderColor: "color-mix(in oklch, var(--foreground) 20%, transparent)" }}
                />
              </label>
              <div className="form-element flex flex-wrap items-center justify-between gap-4 pt-2">
                <MagneticButtonV2
                  type="submit"
                  disabled={status === "sending"}
                  className={cn(
                    "h-11 rounded-full px-5 transition-colors",
                    status === "sent"
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--accent)] text-[var(--color-bone)] hover:bg-[var(--foreground)] hover:text-[var(--background)]"
                  )}
                >
                  {status === "idle" && (
                    <>
                      Send <ArrowUpRight size={14} strokeWidth={1.5} />
                    </>
                  )}
                  {status === "sending" && (
                    <>
                      Sending
                      <Loader2 size={14} className="animate-spin" />
                    </>
                  )}
                  {status === "sent" && (
                    <>
                      Sent <Check size={14} strokeWidth={1.5} />
                    </>
                  )}
                  {status === "error" && (
                    <>
                      Try again <ArrowUpRight size={14} strokeWidth={1.5} />
                    </>
                  )}
                </MagneticButtonV2>
              </div>
              <div
                aria-live="polite"
                className="form-element mt-2 min-h-[1.25rem] w-full"
              >
                {status === "error" && (
                  <p className="font-mono text-xs text-red-400">
                    Something went wrong. Email directly or try again.
                  </p>
                )}
                {status === "sent" && (
                  <p className="font-mono text-xs text-green-400">
                    Message sent successfully.
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="contact-sidebar space-y-8 md:col-span-5">
            <div className="sidebar-item">
              <p className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)]">
                Or, just email
              </p>
              <a
                href={`mailto:${EMAIL}`}
                data-cursor="link"
                className="group inline-flex items-center gap-2 font-display text-2xl text-[var(--foreground)] transition-colors hover:text-[var(--accent)] md:text-3xl"
              >
                <Mail size={20} strokeWidth={1.5} />
                {EMAIL}
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>

            <div className="sidebar-item space-y-3 border-t pt-6" style={{ borderColor: "var(--hairline)" }}>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground-secondary)]">
                Find me elsewhere
              </p>
              <div className="flex flex-col gap-2 font-mono text-sm">
                <a
                  data-cursor="link"
                  href={SITE.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                >
                  <GitHubIcon size={16} />
                  GitHub
                  <ArrowUpRight
                    size={12}
                    strokeWidth={1.5}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
                <a
                  data-cursor="link"
                  href={SITE.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                >
                  <LinkedInIcon size={16} />
                  LinkedIn
                  <ArrowUpRight
                    size={12}
                    strokeWidth={1.5}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </div>
            </div>

            <div className="sidebar-item space-y-2 border-t pt-6 font-mono text-xs" style={{ borderColor: "var(--hairline)" }}>
              <div className="flex justify-between text-[var(--foreground-secondary)]">
                <span>Your local time</span>
                <LocalTime />
              </div>
              <div className="flex justify-between text-[var(--foreground-secondary)]">
                <span>Status</span>
                <span className="text-[var(--foreground)]">Open to final-year roles</span>
              </div>
              <div className="flex justify-between text-[var(--foreground-secondary)]">
                <span>Reply window</span>
                <span className="text-[var(--foreground)]">≤ 48 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}