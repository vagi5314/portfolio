# Portfolio V6 — Senior Frontend Hardening Pass (2026-06-18)

Brutal audit fixes (Awwwards-level standard). No rewrites; surgical fixes
against the existing architecture.

## Key Files

- `app/layout.tsx` — SSR root + `ClientShell` wrapper, skip-link, JSON-LD,
  preconnect hints, theme-color adaptive.
- `app/globals.css` — `cursor: none` only when `.has-custom-cursor` is set by
  JS (no native fallback loss). `noise-overlay` removed.
- `app/page.tsx` — `#main-content` target for skip-link.
- `components/providers/client-shell.tsx` — wraps page content with cursor,
  scroll palette, etc.
- `lib/site.ts` — single source of truth for site URLs, email, identity.
- `next.config.ts` — CSP, HSTS, Permissions-Policy, image config, optimized
  package imports.

## Critical Patterns (DO NOT BREAK)

- **GSAP plugins registered once** in `lib/gsap.ts`. Do not re-register in
  components.
- **Lenis** lives on `window.__lenis`. Always use `window.__lenis.scrollTo`,
  not `window.scrollTo` (native scroll does nothing while Lenis is active).
- **Preloader done signal**: `window.__preloaderDone = true` and
  `window.dispatchEvent("portfolio:preloader-done")` from `CinematicPreloader`.
  Hero waits for this before starting its intro timeline.
- **CSS variables**: scroll palette mutates `--background`, `--foreground`,
  `--accent` on `<html>`. Layout chrome uses these (no hardcoded colors).

## Performance Rules

- **Never put `setState` inside a `gsap.tween.onUpdate`**. Mutate
  `ref.current.textContent` directly (see `NumberTicker`).
- **Never use `cursor: none` globally**. Set `.has-custom-cursor` on `<html>`
  only when a fine pointer is detected.
- **RGBShift** is now a single div with a scale tween on hover. No more
  triple-cloned children.
- **SpotlightTracker** uses rAF-throttled transform on a fixed overlay,
  not CSS-var paint on every mousemove.

## A11y Rules

- Skip-to-content link is in `layout.tsx`. Targets `#main-content`.
- All form fields have explicit `<label htmlFor>` and `autocomplete`.
- `cursor: none` only with JS confirmation; native cursor is fallback.
- Focus rings preserved (see `globals.css` focus-visible rules).
- No `text-[10px]` / `text-[11px]`. Floor is `text-xs` (12px).

## Build

    cd C:\Users\ELCOT\Desktop\Plan\portfolio
    pnpm build
    pnpm dev      # port 3000