# ArchiTrack — Light Glass Redesign

**Date:** 2026-03-20
**Status:** Approved
**Scope:** Full visual redesign of ArchiTrack Dashboard

## Summary

Redesign the ArchiTrack Dashboard by merging two design systems:
- **Digital Architect** — editorial aesthetic, stone palette, Inter font, border-driven layout
- **Glass Pricing (StreamFlow)** — glassmorphism with backdrop-filter blur, translucent surfaces

The result is a "Light Glass" theme: warm stone background (#EAEAE5) with translucent white glass cards, a dark glass sidebar, and editorial typography using Inter.

All inline styles will be migrated to Tailwind CSS classes.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Fidelity to DS | Full adoption | Complete alignment with Digital Architect principles |
| Theme direction | Light Glass | Stone bg + white glass cards = readable + premium |
| Sidebar | Dark Glass | Strong contrast creates clear hierarchy; terra accent pops on dark |
| Cards & Tables | Full Glass | Translucent cards with blur replace shadow-based elevation |
| Implementation | Tailwind migration | Clean up inline styles debt while touching all components |

## Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-main` | `#EAEAE5` | Page background |
| `--bg-glass` | `rgba(255,255,255,0.55)` | Glass card default |
| `--bg-glass-hover` | `rgba(255,255,255,0.72)` | Glass card hover |
| `--glass-blur` | `blur(16px)` | Standard backdrop-filter |
| `--glass-border` | `1px solid rgba(168,162,158,0.3)` | Glass card border |
| `--glass-border-hover` | `1px solid rgba(168,162,158,0.5)` | Glass card border hover |
| `--sidebar-bg` | `rgba(28,28,28,0.94)` | Dark glass sidebar |
| `--stone-900` | `#1C1C1C` | Primary text |
| `--stone-500` | `#78716c` | Secondary text, labels |
| `--stone-400` | `#a8a29e` | Tertiary text, subtitles |
| `--stone-300` | `#d6d3d1` | Borders, dividers |
| `--terra` | `#B5614A` | Brand accent (retained) |
| `--terra-subtle` | `rgba(181,97,74,0.10)` | Terra background tint |

### Typography

| Role | Size | Weight | Tracking | Notes |
|------|------|--------|----------|-------|
| Page Title | 24px | 600 | -0.03em | stone-900 |
| Section Title | 14px | 600 | — | stone-900 |
| KPI Number | 32px | 300 | -0.04em | Light weight, tabular-nums |
| KPI Unit | 14px | 400 | — | stone-400 |
| Label | 9px | 600 | 0.08em | Uppercase, stone-500 |
| Body | 13px | 500 | — | stone-900 |
| Small / Meta | 11px | 500 | — | stone-400 |
| Sidebar Label | 8px | 700 | 0.12em | Uppercase, white/20 |

**Font:** Inter (replacing Plus Jakarta Sans)
- Weights: 300, 400, 500, 600, 700, 800

### Surfaces

| Surface | Background | Blur | Border | Usage |
|---------|-----------|------|--------|-------|
| Glass Card | white/55 | 16px | stone/30 | KPI cards, tables, project cards |
| Glass Hover | white/72 | 16px | stone/50 | Card hover state |
| Dark Glass | #1c1c1c/94 | 16px | white/6 | Sidebar only |
| Modal Glass | white/55 | 20px | stone/35 | Dialogs, overlays |
| Modal Backdrop | #EAEAE5/70 | 8px | — | Behind modals |

### Buttons

| Variant | Background | Border | Text | Hover |
|---------|-----------|--------|------|-------|
| Primary | stone-900 | none | white | #292524 |
| Outline (Glass) | glass | glass-border | stone-900 | glass-hover |
| Destructive | — | — | red-500 | red bg subtle |

### Badges

| Variant | Background | Text |
|---------|-----------|------|
| Duration | stone/15 | stone-700 |
| Source (WhatsApp) | green/8 | green-700 |
| Source (Dashboard) | gray/8 | gray-500 |
| Status (Active) | green/8 + green border | green-700 |
| Alert | yellow/8 + yellow border | yellow-700 |
| Over Budget | red/8 + red border | red-600 |

## Component Architecture

### Glass Card Utility (Tailwind)

New Tailwind utilities in `globals.css`:

```css
.glass {
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(168,162,158,0.3);
  border-radius: 12px;
}
.glass-hover:hover {
  background: rgba(255,255,255,0.72);
  border-color: rgba(168,162,158,0.5);
}
.glass-dark {
  background: rgba(28,28,28,0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.06);
}
.glass-modal {
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(168,162,158,0.35);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.12);
}
```

### Updated CSS Variables

```css
:root {
  --background: 40 8% 91%;        /* #EAEAE5 */
  --foreground: 0 0% 11%;         /* #1C1C1C */
  --card: 0 0% 100% / 0.55;       /* glass */
  --card-foreground: 0 0% 11%;
  --primary: 16 40% 50%;          /* terra */
  --primary-foreground: 0 0% 100%;
  --secondary: 30 5% 80%;         /* stone-300 */
  --muted: 30 5% 80%;
  --muted-foreground: 25 5% 47%;  /* stone-500 */
  --border: 28 8% 66% / 0.3;      /* glass border */
  --radius: 0.75rem;               /* 12px */
}
```

### Sidebar

- Dark glass background with blur
- Logo: terra icon (#B5614A) with glow shadow
- Brand name: Inter 14px/700, white
- Nav items: Tailwind classes replacing inline styles
- Active state: terra/18 bg + 2px left border + terra dot
- Hover: white/6 bg
- Logout: red subtle on hover

### KPI Cards

- Glass surface with gradient accent line at top
- Accent line: `background: linear-gradient(90deg, [color], transparent)`
- Card 1 (Hours): terra accent
- Card 2 (Projects): stone-500 accent
- Card 3 (Entries): stone-400 accent
- Number: 32px / weight 300 / tracking -0.04em / tabular-nums
- Label: 9px / weight 600 / tracking 0.08em / uppercase / stone-500
- No icon boxes (simplified from current design)

### Tables

- Glass container with border-radius 12px
- Header: 14px title + uppercase count badge
- Row hover: white/30 (glass intensification)
- Columns use same structure, just glass bg
- Duration badges: stone/15 bg, stone-700 text
- Source badges: colored per source type

### Project Donut Cards

- Glass surface replacing white bg + shadow
- Accent bar at top (project color)
- Donut SVG: track color `rgba(168,162,158,0.15)` replacing `#f1f5f9`
- Active state: project color border + subtle glow
- Hover: glass-hover + translateY(-2px)

### Modals & Dialogs

- Backdrop: `rgba(234,234,229,0.7)` + `blur(8px)` (light glass backdrop)
- Modal: glass-modal surface (blur 20px)
- Gradient divider line between header and body
- Form inputs: glass bg (`white/40`), stone borders
- Focus ring: terra color for login, stone-500 for dashboard forms

### Login Page

- Background: #EAEAE5 with subtle grid pattern (stone/4)
- Card: glass-modal surface
- Logo: terra icon with glow
- Brand: Inter 22px/700, stone-900
- Input focus: terra ring
- Submit button: stone-900 (primary), not terra (more editorial)
- Link colors: terra for accents

### Project Detail Panel

- Slide panel: glass surface instead of solid #fafafa
- Header section: dark glass (like sidebar) instead of #0f172a
- Stats grid: glass cards instead of white bg
- Sections: glass surfaces with stone borders
- Timeline dots: stone palette

### Team / User Cards

- Glass surface replacing white bg
- Role accent bar at top
- Avatar: same deterministic color system
- Hover: glass-hover + slight lift
- Badge styling aligned with DS stone palette

## Files to Modify

### Core (3 files)
1. `src/app/globals.css` — New CSS variables, glass utilities, remove old utilities
2. `tailwind.config.ts` — Update token values, add glass colors
3. `src/app/layout.tsx` — Change font from Plus Jakarta Sans to Inter

### Layout (2 files)
4. `src/components/layout/sidebar.tsx` — Full rewrite to Tailwind, dark glass
5. `src/app/(dashboard)/layout.tsx` — Update background, padding classes

### Auth Pages (4 files)
6. `src/app/login/page.tsx` — Glass card, editorial typography
7. `src/components/auth/login-form.tsx` — Tailwind classes, glass inputs
8. `src/app/signup/page.tsx` — Align with login design
9. `src/app/reset-password/page.tsx` — Align with login design
10. `src/app/update-password/page.tsx` — Align with login design

### Overview (4 files)
11. `src/app/(dashboard)/overview/page.tsx` — Page header typography
12. `src/components/overview/kpi-cards.tsx` — Glass cards, new KPI style
13. `src/components/overview/overview-client.tsx` — Glass donut cards, glass section wrapper
14. `src/components/overview/time-entries-table.tsx` — Glass table

### Projects (2 files)
15. `src/app/(dashboard)/projects/page.tsx` — Page header, badges
16. `src/components/projects/projects-table.tsx` — Glass table

### Team (2 files)
17. `src/app/(dashboard)/team/page.tsx` — Page header
18. `src/components/team/user-card-list.tsx` — Glass user cards

### Shared (2 files)
19. `src/components/shared/project-detail-panel.tsx` — Glass panel, dark glass header
20. `src/components/shared/new-entry-dialog.tsx` — Glass modal

### Settings (3 files)
21. `src/app/(dashboard)/settings/page.tsx` — Page header
22. `src/components/settings/add-project-dialog.tsx` — Glass modal
23. `src/components/settings/add-user-dialog.tsx` — Glass modal

**Total: ~23 files**

## Constraints

- **Light mode only** — no dark mode support in this iteration (CSS variable structure supports it later if needed)
- **backdrop-filter fallback** — modern browsers all support it; no fallback needed for this project's audience (internal tool)
- **Destructive button** — transparent bg with red text; red/10 bg on hover

## Success Criteria

1. All pages render with glass surfaces on #EAEAE5 background
2. Inter font loads and renders at all weight levels
3. Sidebar displays dark glass effect with blur visible
4. KPI cards show glass translucency (content behind slightly visible)
5. Tables and cards respond to hover with glass intensification
6. Modals appear with backdrop blur and glass surface
7. No inline `style={{}}` remains on visual properties (layout flex/grid ok)
8. All existing functionality preserved (auth, CRUD, navigation)
9. Responsive behavior maintained on mobile viewports
10. No TypeScript or build errors
