# Portfolio V6 — Handoff Document

> Last updated: 2026-06-08
> Build: PASSING (0 errors, 11 static routes, Next.js 16.2.7)
> Dev server: `npm run dev` on port 3000
> Status: V6 critical fixes complete. E2E visual audit IN PROGRESS.

---

## 1. Project Overview

Cinematic 2D scroll-driven portfolio. Next.js 16 App Router, React 19, Tailwind v4, GSAP 3.15, Lenis 1.3. Zero budget, free hosting only.

Design philosophy: Quiet interfaces, durable infrastructure. No 3D, no WebGL. DOM + SVG only.

---

## 2. What Changed in V6 (This Session)

### Critical Fixes Applied

| Fix | File | What |
|-----|------|------|
| ReelSection cards frozen | components/reel-section.tsx | Replaced broken window.addEventListener("scroll") + rAF + look-gate with ScrollTrigger.create(). Cards now morph: scatter -> circle -> arc -> grid. |
| SVG hydration crash | app/layout.tsx | Moved SVG warp filters from head to body. Next.js 16 forbids SVG in head. |
| ReelSection import | components/reel-section.tsx | Import { useGSAP, gsap, ScrollTrigger } from @/lib/gsap. gsap is NOT on window. |
| LiquidCursor empty src | components/liquid-cursor.tsx | Added if (src) guard before setHover(). Added mouseout handler to clear hover. |
| magnetic-button cursor | components/magnetic-button.tsx | Changed data-cursor="project" to data-cursor="link" (had no thumb). |
| Next project cursor | work-view.tsx + page.tsx | Added thumb field to Props.next type and page.tsx destructure. |

### Deleted Files

| File | Why |
|------|-----|
| components/film-grain.tsx | GPU bottleneck: 2850x1800px fixed div at z-9999 animating continuously |
| components/section-wipe.tsx | All 4 instances invisible (scale(0), zero visual effect) |
| components/nav-dock.tsx | Redundant — NavRail handles same function |

### Performance Fixes

| Fix | File | What |
|-----|------|------|
| Film grain removed | layout.tsx + globals.css | Deleted keyframes grain, .grain-overlay, .vignette-overlay |
| Section wipe CSS removed | globals.css | Deleted .section-wipe rule |
| ScrollPalette throttled | scroll-palette.tsx | if (progress < 0.75) return; — skips ~75% of scroll |
| LiquidCursor glow | liquid-cursor.tsx | 800x800 to 300x300, opacity 0.04 to 0.06 |
| Typography fixes | 6 files | 20 instances of text-[10px]/text-[9px] to text-xs (12px) |

---

## 3. Current Architecture

### Page Flow (app/page.tsx)

CinematicPreloader -> FilmRollHero (100vh) -> ReelSection (500vh) -> About (600vh) -> Process (500vh) -> Metrics -> Contact -> Footer

### Layout (app/layout.tsx)

html -> body -> svg warp filters -> SmoothScrollProvider -> CursorProvider -> ScrollPalette + LiquidCursor + ScrollProgressBar + ChapterCounter + KeyboardNav + ChapterHelp + {children} + NavRail

### Total Scroll

~12,600px (~14 viewports at 900px). Breakdown:
- Hero: 600px (1vh)
- ReelSection: 3000px (5vh, pinned)
- About: 3600px (6vh, horizontal scroll)
- Process: 3000px (5vh, pinned timeline)
- Metrics: 668px (1.1vh)
- Contact: 951px (1.6vh)
- Footer: 818px

---

## 4. File Inventory

### Components (26 files)

    chapter-counter.tsx        — "01 / 07 INTRO" persistent counter + keyboard nav
    cinematic-preloader.tsx    — 5-4-3-2-1 film leader countdown
    film-roll-hero.tsx         — 100vh hero, scroll parallax, text scramble on hover
    image-distortion.tsx       — SVG feTurbulence + feDisplacementMap hover
    liquid-cursor.tsx          — Custom cursor: ring/dot/glow (300x300)
    local-time.tsx             — Live clock display
    magnetic-button.tsx        — Simple magnetic button (data-cursor="link")
    magnetic-button-v2.tsx     — Elastic.out magnetic button (gsap.quickTo)
    marquee.tsx                — Infinite scroll marquee
    nav-rail.tsx               — Right-side dot navigation with tubelight glow
    number-ticker.tsx          — Animated number counter
    pinned-horizontal.tsx      — Generic horizontal scroll pin
    project-row.tsx            — Project list row for work page
    reel-section.tsx           — 500vh pinned, 4 cards morph (SCATTERED->CIRCLE->ARC->GRID)
    reveal-text.tsx            — Per-line scroll reveal text
    rgb-shift.tsx              — R/G/B mix-blend-mode screen effect
    scroll-palette.tsx         — Scroll-linked CSS var color interpolation (activates at 75%)
    scroll-progress-bar.tsx    — Top progress bar (1px, rust fill)
    section-divider.tsx        — Chapter title divider
    warp-link.tsx              — Next.js Link with click pulse + viewTransitionName

    providers/
      cursor-provider.tsx      — Touch detection + cursor state
      smooth-scroll-provider.tsx — Lenis + GSAP bridge (window.__lenis)

    sections/
      about.tsx                — 600vh horizontal scroll, 4 panels
      contact.tsx              — Contact form + sidebar (local time, email)
      footer.tsx               — z-[70], project list, social links, signature
      metrics.tsx              — Per-line scroll reveal, number tickers
      process.tsx              — 500vh pinned timeline, vertical progress line

### Deleted Components

    DELETED: film-grain.tsx, section-wipe.tsx, nav-dock.tsx

### Key Libraries

    lib/
      gsap.ts          — Exports { gsap, ScrollTrigger, useGSAP }. Registers plugins on window.
      look-gate.ts     — Global scroll velocity tracker (EMA). subscribeLookGate().
      projects.ts      — 4 projects with neutral copy, SVG placeholders, thumb fields.
      use-reduced-motion.ts — prefers-reduced-motion hook.
      utils.ts         — cn() helper.

---

## 5. Critical Bugs Still Being Investigated (E2E Audit IN PROGRESS)

### 5.1 mix-blend-difference text readability on reel cards (IDENTIFIED)

Issue: Cards with light SVG backgrounds (Loopin OS, Still Water) use mix-blend-difference for text labels. On light cards, bone text + mix-blend-difference = nearly invisible.
File: components/reel-section.tsx lines 185-192.
Fix needed: Use mix-blend-difference only on dark cards, or switch to text-shadow/drop-shadow.

### 5.2 Contact/Footer scroll palette transition (NEEDS VERIFICATION)

Issue: ScrollPalette only activates at progress > 0.75. Earlier screenshot attempts showed Contact area still dark due to scrub lag.
File: components/scroll-palette.tsx.

### 5.3 Section readability timing (USER REPORTED)

User complaint: "some sections scroll away before I can read."
Need to verify:
- Metrics: 668px only — may be too short
- Contact: 951px — may feel tight
- All pinned sections should give enough scroll distance

### 5.4 Screenshot timeout issue (TECHNICAL)

Browser screenshot tool times out at certain scroll positions. GSAP animation causing heavy rendering with immediate: true scroll.
Workaround: Use non-immediate scrolls with 2-3s waits.

### 5.5 ScrollPalette on project pages

Project pages have bg-bone on main but html/body stay dark. ScrollPalette skips when progress < 0.75. The main class overrides visually but CSS vars stay dark.

---

## 6. E2E Audit Checklist (FOR NEXT SESSION)

### Homepage (scroll through every section, screenshot each)

    [ ] Hero (pos 0): Text fully readable, no overlaps, CTAs visible
    [ ] Hero-to-Reel transition (~500px): Clean transition, no text collision
    [ ] Reel scattered (~900px): All 4 cards visible, text readable on ALL cards (especially light ones)
    [ ] Reel mid-morph (~1400px): Cards transitioning, no overlap between cards
    [ ] Reel grid (~2400px): Cards in grid, summaries visible at bottom
    [ ] Reel-to-About transition (~3000px): Clean handoff
    [ ] About horizontal scroll (~4000px): All 4 panels visible, text readable
    [ ] About-to-Process transition (~7000px): Clean handoff
    [ ] Process pinned (~8500px): Timeline visible, text readable
    [ ] Process-to-Metrics transition (~10000px): Clean handoff
    [ ] Metrics (~10200px): All metric cards visible, numbers + labels readable
    [ ] Contact (~10868px): Light bone theme applied, headline + form readable
    [ ] Footer (~11819px): Project list, social links, signature all readable
    [ ] NavRail: Never overlaps main content at any scroll position

### Project Pages (check all 4)

    [ ] /work/atlas-card: Cover, meta, body, metrics, next-project CTA
    [ ] /work/loopin-os: Same
    [ ] /work/still-water: Same
    [ ] /work/ledger-of-edges: Same
    [ ] Zero console errors on all project pages
    [ ] Text contrast: bone on ink or ink on bone (no dark-on-dark)

### Performance

    [ ] Zero console errors across all pages
    [ ] No elements permanently stuck at opacity:0
    [ ] Film grain gone (0 CSS animations vs 33 before)
    [ ] No text-[10px] or text-[9px] anywhere

---

## 7. What Was Done Visually (Confirmed Working)

| Section | Screenshot Status | Notes |
|---------|------------------|-------|
| Hero | CONFIRMED | "Designing the seams of software" renders clean |
| Reel scattered | CONFIRMED | 4 cards visible, scattered positions |
| Reel morphing | CONFIRMED | Cards moved from scattered to circle to grid |
| Reel grid + summaries | CONFIRMED | 4-card grid with text summaries below |
| About transition | CONFIRMED | "I design the seams of software" heading visible |
| Process | CONFIRMED | "The build is the interface" heading visible |
| Contact + Footer | CONFIRMED | "Let's work together" headline, bone theme, project list |
| Project page (atlas-card) | CONFIRMED | Header, stack, summary, metrics cards, body text |
| Project pages (all 4) | CONFIRMED | All load with correct titles, bone background, full content |

---

## 8. Critical Context for Next Session

### Build and Run

    cd C:\Users\ELCOT\Desktop\Plan\portfolio
    npm run build          # Passes, 0 errors, 11 routes
    npm run dev            # Dev server on :3000

### GSAP Setup (DO NOT BREAK)

    // lib/gsap.ts — SINGLE source of truth
    import gsap from "gsap";
    import { ScrollTrigger } from "gsap/ScrollTrigger";
    import { useGSAP } from "@gsap/react";
    gsap.registerPlugin(ScrollTrigger, useGSAP);
    export { gsap, ScrollTrigger, useGSAP };

### Lenis + GSAP Bridge

    // smooth-scroll-provider.tsx
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;

### Window Objects

    window.__lenis — Lenis instance. Use scrollTo(target, { immediate: true }).
    GSAP is NOT on window. Import from @/lib/gsap.

### ScrollTrigger Pattern That Works

    ScrollTrigger.create({
      trigger: rootEl,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3,
      onUpdate: (self) => { /* use self.progress */ }
    });

### Pattern That BROKE ReelSection (DO NOT USE)

    // DO NOT: window.addEventListener("scroll", ...) — Lenis intercepts native scroll
    // DO NOT: requestAnimationFrame + manual getBoundingClientRect — wont fire
    // DO NOT: look-gate "settled" gate on onUpdate — blocks during active scrolling

### Color Tokens

    --color-ink:    #0E0E10    (dark background)
    --color-ink-2:  #1A1A1D
    --color-ink-3:  #2A2A2E
    --color-bone:   #F2EDE4    (light text/bg)
    --color-bone-2: #E5DED1
    --color-bone-3: #D8D0BF
    --color-rust:   #E85A2B    (accent)
    --color-rust-2: #D14820
    --color-rust-3: #B83A19

### Section IDs (for Nav + Chapter Counter)

    hero         — Intro          (01)
    work         — Selected Work  (02)
    about        — About          (03)
    process      — Process        (04)
    metrics      — Metrics        (05)
    contact      — Contact        (06)
    site-footer  — Footer         (07)

### AGENTS.md Rule

    "This is NOT the Next.js you know — read node_modules/next/dist/docs/ before writing any code."

### Lenis Gotchas

    - window.scrollTo() does nothing while Lenis is active
    - Use window.__lenis.scrollTo(target)
    - Lenis option: eventsTarget (not wheelEventsTarget)
    - ScrollTrigger "end: +=500%" = 5x viewport scroll

---

## 9. User Feedback History

- V3 to V4: "looks really good, significant improvement, room for creativity"
- V4 to V5: "warps for projects", "I can see it transform before I read", "senior frontend agency"
- V5 to V6: "cards are not moving or morphing, entire page is just lagging" (fixed), "sections scroll away before i can read", "I can see some overlapping texts", "search web live for any additional info"
- V6 user decisions: Remove grain entirely, delete wipes, remove NavDock, keep both distortion + RGB shift, keep warp filters

---

*End of handoff. Build passes. All critical fixes applied. E2E visual audit needs to be completed in next session.*
