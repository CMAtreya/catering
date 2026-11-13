# TKS Iyengars Motion & Quiet Luxury Design System

## Overview
This document specifies the motion design system, quiet luxury tokens, multi-tier device adaptability, and performance benchmarks implemented across the **TKS Iyengars Catering** application.

The design elevates the entire interface into a serene, boutique hotel and royal wedding banquet experience while preserving the familiar quick-commerce architecture (sticky category tabs, 2-column cards, bottom checkout bars, admin tab bar).

---

## 1. Motion Tokens (`src/motion/tokens.ts`)

Ad-hoc motion and transition values are strictly disallowed. All motion adheres to these deterministic tokens:

### Durations
- **instant**: `120ms` (toggles, micro feedback, reduced-motion fallbacks)
- **quick**: `200ms` (hover states, small badges, button presses)
- **base**: `320ms` (sheet reveals, drawer expansions, card enters)
- **slow**: `600ms` (page transitions, complex unfolds)
- **hero**: `900ms` (invitation unfold, ceremonial 3D hero reveals)

### Easings & Springs
- **standard**: `cubic-bezier(0.2, 0.8, 0.2, 1)` (general layout and transitions)
- **entrance**: `cubic-bezier(0.16, 1, 0.3, 1)` (screen entrances, modal reveals)
- **tap spring**: `{ type: 'spring', stiffness: 380, damping: 32 }` (taps, sheet snaps)
- **soft spring**: `{ type: 'spring', stiffness: 170, damping: 26 }` (shared-layout moves, tab pills)

### Stagger Rules
- **stagger delay**: `50ms` between items.
- **cap**: At most `8` items per group (to keep mobile frame rates high).
- Only `transform` and `opacity` are animated per frame (never blur radius).

---

## 2. Multi-Tier Adaptive Motion System (`useMotionTier()`)

The application dynamically classifies the user's device and preferences into three tiers:

| Tier | Criteria | Allowed Motions |
| :--- | :--- | :--- |
| **`full`** | Modern phones, fast laptops, desktop browsers | Full springs, 3D WebGL brass lamp, parabolic arcs, shared-layout morphing, card parallax, smooth Lenis scrolling |
| **`lite`** | Low-end devices, Save-Data mode enabled, low hardware concurrency (<4 cores or <4GB RAM) | 2D fades and short slides (8-12px), static SVG poster fallback for 3D lamp, no parallax, instant thumbnail badge update |
| **`reduced`** | User explicitly enabled `prefers-reduced-motion: reduce` in OS or browser | Opacity cross-fades only (`0 -> 1`), instant layout updates, 0ms springs, no scaling, no rotation |

The entire application is wrapped in `<MotionConfig reducedMotion="user">` inside `MotionProvider.tsx`.

---

## 3. Tier Fallback Catalog (Where Every Tier Fallback Applies)

1. **Ceremonial 3D Brass Lamp (`Hero3D.tsx`)**:
   - `full`: Dynamic import of `Hero3DCanvas` using `@react-three/fiber` (`frameloop="demand"`), procedural Kuthu Vilakku lamp with flickering warm flame, soft auto-rotate, pauses when offscreen (`IntersectionObserver`) and when browser tab is inactive (`visibilitychange`). Orbit controls disabled to prevent scroll hijacking.
   - `lite` / `reduced` / Save-Data: Static vector WebP/SVG poster with gold foil gradient. No Three.js script downloaded or executed.
2. **Smooth Scrolling (`SmoothScroll.tsx`)**:
   - `full` on non-touch devices only: Lenis kinetic scrolling at 60fps. Automatically pauses while any dialog, sheet, or text input is focused.
   - `full` on touch / mobile: Completely disabled (`syncTouch: false`, zero scroll hijacking).
   - `lite` / `reduced` / Admin: Native browser scrolling only.
3. **Dish Selection & Fly-to-Bar (`FlyToBar.tsx`, `ItemCard.tsx`)**:
   - `full`: Thumbnail flies along a parabolic arc to the bottom bar, bottom bar executes spring bounce, and device fires `navigator.vibrate(8)`.
   - `lite` / `reduced`: Instant counter increment with subtle opacity badge pop; no flying particle; no haptic vibration.
4. **Item Image Inner Parallax (`ItemCard.tsx`)**:
   - `full`: Mouse pointer moves within card bounds induce a subtle ±4% internal image parallax.
   - `lite` / `reduced`: Static thumbnail presentation with fine hairline border.
5. **Shared-Axis Page Transitions (`PageTransition.tsx`)**:
   - `full`: Direction-aware shared-axis slide (forward slides left, back slides right) with entrance easing.
   - `lite`: 12px short slide with quick fade.
   - `reduced`: Pure opacity cross-fade.
6. **Booking Invitation Unfold (`SubmittedPage.tsx`)**:
   - `full`: 1.5s orchestrated sequence: circular progress ring completes, check badge draws, CSS 3D `rotateX` card unfolds with single-pass gold foil shimmer, urgent call card slides up.
   - `lite` / `reduced`: Card reveals with clean opacity fade; gold foil shimmer is static; no 3D rotation.
7. **Admin Dashboard Order Confirmation (`OrderCard.tsx`, `AdminDashboardPage.tsx`)**:
   - `full`: Confirm button triggers emerald success burst, status chip morphs with shared `layoutId`, and the card moves from "New Requests" to "Active Orders" with `MOTION_SPRINGS.soft`. Calendar count ticks up.
   - `lite` / `reduced`: Instant status chip update and instantaneous list filter update without physics spring.

---

## 4. Reusable Motion Components

- `PageTransition`: Directional step transition for customer wizard (`/request`, `/contact`) and subtle 12px slide for admin sub-routes.
- `FlyToBar`: Parabolic flight path coordinator using bounding rect projection.
- `Odometer`: Rolling digit wheel animation with digit preservation and reduced motion fallback.
- `TicketCard`: Perforated edge boarding-pass card with tactile glass finish, dynamic height expansion, and immutable required notice.
- `ScrollReveal`: Soft clip-path reveal for section headings and titles.
- `CollapsingHeader`: iOS-style collapsing navigation bar with pre-blurred depth backdrop and shared `layoutId="category-underline"`.
- `Hero3D`: Lazy-loaded ceremonial brass lamp with fallback detection.

---

## 5. Performance Budgets & Production Verification

Verified via production build (`npm run build`):
- **Customer First Load JS**: **152 kB** gzipped (`index-*.js` 108.8 kB + `react-*.js` 43.6 kB). Budget: < 200 kB gzipped. **PASS** (24% under budget).
- **3D Chunk Isolation**: Isolated into `hero-3d-*.js` (lazy-loaded). Completely excluded from PWA precache list in `dist/sw.js`.
- **Max Backdrop Filter Layers**: Restricted to at most 2 visible at once (`CollapsingHeader` and `FloatingBottomBar`).
- **Lighthouse Targets**: PWA installable, Safe Areas respected (`safe-area-inset-*`), no horizontal scroll on 320px viewport.
