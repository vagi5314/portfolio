# Portfolio

A cinematic 2D scroll portfolio. No 3D, no marketing fluff — just the work, told with receipts.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · GSAP + Lenis · Vercel

**Live:** <https://portfolio-nine-kohl-x71b83bwy1.vercel.app>

## What's in here

Ten sections, four case studies, one résumé — built to read like a pull request, not a reel.

| Section | What it does |
|---|---|
| `00` Preloader | Ink-curtain fade-in (no spinner, no AI slop) |
| `01` Hero | `font-display` lockup, 3-line clip-path reveal, magnetic CTAs |
| `02` Reel | Pinned 500vh, 4 cover cards morph (scatter → circle → arc → grid) |
| `03` About | Pinned 600vh horizontal scroll, 4 panels (seams / who / stack / now) |
| `04` Process | Pinned 500vh timeline, 4 steps reveal against a scroll progress bar |
| `05` Numbers | 4 GSAP-tweened number tickers, verified counts |
| `06` Contact | formsubmit.co form + sidebar status, time-token honeypot |
| `07` Footer | Three-column sign-off + colophon |

Plus a custom cursor (rust dot + bone ring), a top scroll progress bar, a
right-side chapter rail, and a keyboard nav layer (`1`–`7`, `J`/`K`, `Esc`).

## How it's built

- **One motion library.** GSAP owns every animation. Lenis owns every scroll frame. They are synchronised through `gsap.ticker` and `lenis.on("scroll", ScrollTrigger.update)`.
- **No runtime 3D.** Every visual trick is CSS, SVG, or `clip-path`. The hero background is a radial-gradient with a static SVG turbulence overlay.
- **Hand-rolled primitives.** The 18 custom components in `components/` exist because pulling a second animation library would have violated the "one motion library" rule.
- **No blog.** The 4 projects in `lib/projects.ts` are real case studies.
- **Design tokens in one place.** `app/globals.css` defines every color, type scale, radius, and hairline in `@theme inline { ... }`. Override one CSS variable and the whole site moves.
- **Site identity in one place.** `lib/site.ts` exports `SITE` (URL, email, résumé path, social). Every component imports from here.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
pnpm start
```

Turbopack is the default. No `--turbopack` flag needed.

## Content

| File | Notes |
|---|---|
| `lib/projects.ts` | Real project records. Schema is `Project { slug, title, tag, role, year, cover, thumb, stack, summary, metrics, body }`. |
| `public/projects/[slug]/cover.svg` | 16:10 covers, hand-drawn SVG per project. |
| `public/projects/[slug]/thumb.svg` | 1:1 thumbs. |
| `public/projects/jobflow/body-1.png`, `body-2.png` | Inline figures (only JobFlow ships PNGs). |
| `lib/site.ts` | `SITE_URL`, `email`, social handles. |
| `components/sections/metrics.tsx` | Verifiable numbers from the four projects. |

Résumé is available on request — see `components/sections/contact.tsx`.

## Accessibility

- All animations respect `prefers-reduced-motion: reduce`.
- The custom cursor is JS-gated: only enabled when a fine pointer is detected. Native cursor stays as fallback.
- `cursor: none` is opt-in via `.has-custom-cursor` on `<html>`, never global.
- Skip-to-content link targets `#main-content`.
- Form fields have explicit `<label htmlFor>` and `autocomplete`.
- All routes serve a `loading.tsx` and `error.tsx` boundary.

## Security

- Strict CSP, HSTS, X-Frame-Options, Permissions-Policy headers in
  `next.config.ts`.
- Contact form has a time-token (rejects submits < 2.5s after focus) +
  honeypot field.
- No real API keys in source; secrets live in env files outside the
  bundle.

## License

MIT. The 4 projects (AeroMetric, Global AI Readiness, JobFlow, LeadSentry) are real; cover SVGs are hand-drawn to match the atlas-card aesthetic.
