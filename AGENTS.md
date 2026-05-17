<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# The Great Odyssey — Agent Context

## What This Is

A life-planning web app based on the "Designing Your Life" / Odyssey Plan methodology. Users create three parallel 5-year life plans (Life I/II/III), map milestones, rate each plan on four gauges, and prototype paths with small experiments. An AI guide with full plan context assists from every page.

## Tech Stack

- **Framework**: Next.js 16 App Router (`src/app/`)
- **Auth + DB**: Supabase (client at `src/lib/supabase/`, types at `src/lib/types/index.ts`)
- **Styling**: Quiet Ledger design system (see below) — Tailwind for layout only
- **Icons**: Lucide React — always `style={{ width: N, height: N }}`, never `className` for sizing
- **Fonts**: Inter (body) + Caveat (accent/year labels) via Google Fonts in `globals.css`
- **AI**: Anthropic SDK — `/api/ai/route.ts` fetches full plan context per request
- **Linear**: https://linear.app/data-data/project/the-great-odyssey-295f5d572761

Note: ReactFlow (`@xyflow/react`) has been **removed**. RoadmapView is now a plain vertical QL timeline — no canvas dependency.

## File Structure

```
src/
  app/
    (auth)/login/           — login page
    (auth)/signup/          — signup page
    (app)/                  — authenticated shell
      dashboard/            — dashboard (frontispiece layout)
      plans/[id]/           — plan workspace
        page.tsx            — Today / frontispiece page
        layout.tsx          — fetches plan, mounts PlanTabNav + PlanGuideShell
        wizard/             — life plan editor (WizardShell + LifePlanEditor)
        timeline/           — Foldout view (3-life comparison grid)
        roadmap/            — Roadmap view (vertical QL timeline)
        prototype/          — Prototypes / Underway view
        reflections/        — Marginalia (unstructured notes)
    api/ai/route.ts         — AI guide POST endpoint
  components/
    ui/
      AppNav.tsx            — global sidebar + mobile drawer
      PlanTabNav.tsx        — plan-level left nav (Today / I/II/III / Foldout / Roadmap / Prototypes / Marginalia)
      PlanGuideShell.tsx    — layout-level AI guide wrapper (FAB + panel, all plan pages)
      QLComponents.tsx      — shared QL SVG primitives (wordmark, seals, ornament, ticks, etc.)
      CreatePlanButton.tsx
    wizard/                 — WizardShell, LifePlanEditor, DashboardGauges, MilestoneCard
    timeline/               — TimelineView
    roadmap/                — RoadmapView
    prototype/              — PrototypeView
    ai-guide/               — AiGuide (chat UI, called by PlanGuideShell)
    reflections/            — ReflectionsView
  lib/
    types/index.ts          — canonical types + QL constants (QL_COLORS, LIFE_NUMERALS, HAND_LABELS, LIFE_SEAL_IDS)
    supabase/               — client.ts + server.ts
```

## Quiet Ledger (QL) Design System

**All visual styling must use inline `style={{}}` with CSS variables. No Tailwind color, shape, or shadow classes.**

Tailwind is permitted for layout and responsive behavior: `flex`, `h-full`, `flex-col`, `flex-1`, `overflow-auto`, `hidden`, `sm:inline`, `sm:hidden`, `fixed sm:static`, `grid grid-cols-1 sm:grid-cols-3`, etc.

**Responsive rule:** Use Tailwind `sm:` classes for structural/positional breakpoint changes. Keep all QL visual values (`color`, `border`, `background`, `fontSize`, `padding` for brand-defined spacing) in `style={{}}`. **Never set `display` in `style={{}}` on an element that also uses Tailwind `hidden`/`flex` — let the class own it.** This is a frequent bug: inline `display: flex` overrides `sm:hidden`, causing elements to show on desktop. Use `className="flex sm:hidden"` instead.

### CSS Variables (defined in `globals.css`)

| Variable | Value | Use |
|---|---|---|
| `--ql-paper` | `#fbfaf6` | Main background |
| `--ql-paper-deep` | `#f3f1ea` | Cards, panels, inputs |
| `--ql-ink` | `#0d0c08` | Primary text, filled buttons |
| `--ql-ink-soft` | `#3a3830` | Secondary text |
| `--ql-ink-faint` | `#9a9485` | Placeholder, muted labels |
| `--ql-rule` | `#dad5c5` | All borders |
| `--ql-l1` | `#2c3e6b` | Life I / expected (navy) |
| `--ql-l2` | `#3f5b34` | Life II / alternative (moss) |
| `--ql-l3` | `#8a4f23` | Life III / wildcard (rust) |

### Life Type → Color / Label Mapping

All constants live in `src/lib/types/index.ts` — import from there, never redefine locally:

```ts
import { QL_COLORS, LIFE_NUMERALS, HAND_LABELS, LIFE_SEAL_IDS } from '@/lib/types'

// QL_COLORS:    expected → var(--ql-l1), alternative → var(--ql-l2), wildcard → var(--ql-l3)
// LIFE_NUMERALS: expected → 'I', alternative → 'II', wildcard → 'III'
// HAND_LABELS:  expected → "the path I'm on", alternative → 'if it disappeared', wildcard → 'no obstacle'
// LIFE_SEAL_IDS: expected → 'L1', alternative → 'L2', wildcard → 'L3'
```

Life tab display pattern: `[QLSeal] [Caveat numeral] [italic hand label]` — never "Life I/II/III" text.

### QLComponents

Shared SVG primitives in `src/components/ui/QLComponents.tsx`:
- `QLWordmark` — compass star + sextant arc logo
- `QLSeal` — per-life seal icon (L1: compass rose, L2: book spine, L3: anchor)
- `QLOrnament` — horizontal divider with tilde motif
- `QLTicks` — 11-tick gauge track, filled to `Math.round(value/10)`, major ticks at 0/5/10
- `QLMarginQuote` — blockquote with left border rule
- `QLPageFoot` — folio label at page bottom
- `QLPaperTexture` — fixed SVG noise overlay at 0.025 opacity

### Design Rules

- **No rounded corners** — `borderRadius: 0` everywhere
- **No shadows** — never `boxShadow`
- **Hairline borders only** — `1px solid var(--ql-rule)` or `1px solid <accent-color>`
- **Ink-filled buttons** — primary actions: `background: 'var(--ql-ink)', color: 'var(--ql-paper)'`
- **Outlined secondary buttons** — `background: 'none', border: '1px solid var(--ql-rule)'`
- **Caveat font** — year labels, numerals, guide headers: `fontFamily: "'Caveat', cursive"`
- **Inter font** — all other text: `fontFamily: "'Inter', sans-serif"`
- **Uppercase labels** — `fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase'`

### Input Style Pattern

```ts
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--ql-paper)',
  border: '1px solid var(--ql-rule)',
  padding: '8px 10px',
  fontSize: 13,
  color: 'var(--ql-ink)',
  outline: 'none',
  fontFamily: "'Inter', sans-serif",
  boxSizing: 'border-box',
}
```

## Database Schema — Critical Facts

### Tables

- `odyssey_plans` — top-level plan container (`id`, `user_id`, `name`)
- `life_plans` — one per life type per plan (`odyssey_plan_id`, `type`, `title`, `questions`, `gauge_*`, flat columns)
- `milestones` — linked to `life_plans` (`life_plan_id`, `year 1–5`, `title`, `category`, `position?`)
- `prototypes` — linked to `life_plans` (`life_plan_id`, `type`, `title`, `description`, `status`, `scheduled_date`, `notes`)
- `plan_reflections` — marginalia notes linked to `odyssey_plans` (`odyssey_plan_id`, `user_id`, `text`, `created_at`)

### Gauge columns are FLAT, not nested

```ts
gauge_resources: number
gauge_likeability: number
gauge_confidence: number
gauge_coherence: number
```

Never access `lifePlan.gauges.resources` — that shape does not exist. Always use `lifePlan.gauge_resources` etc.

### Prototypes use `scheduled_date`, not `date`

`scheduled_date: string | null` — not `date`.

### Milestone `position` is optional

`Milestone.position?: number` — always use `?? 0` when sorting by position.

## AI Guide Architecture

The guide is mounted at **plan layout level** via `PlanGuideShell`, so it's available on every plan page.

- `PlanGuideShell` manages `aiOpen` state, reads `?life=` from URL for context, renders FAB + panel
- `AiGuide` is the chat UI component — props: `planId: string`, `activeLifeType: LifePlanType`
- `/api/ai/route.ts` accepts `{ planId, activeLifeType?, messages }` and fetches the full plan:
  - All 3 life plans (titles, questions, gauges, milestones)
  - All prototypes across all life plans
  - All `plan_reflections` (marginalia notes)
- System prompt includes everything so the guide can reference the complete plan without user pasting

Do **not** pass `lifePlanId` to the guide — it takes `planId` (the odyssey plan UUID).

## React Patterns Used in This Codebase

### Stable list keys

Never use array index as key for lists that can be reordered or deleted. Use:
- Existing DB records: `key={item.id}`
- New unsaved records: `key={item.id ?? \`new-${item._clientKey}\`}` with a `useRef` counter

### Always-mounted panels

When two panels share a tab toggle, render both with `display: 'none'` / `display: 'flex'` rather than conditional rendering. Conditional rendering unmounts and destroys form state.

### Responsive panels (dual-render pattern)

When a panel needs fundamentally different layout at a breakpoint, render two versions:

```tsx
{/* desktop */}
{open && <div className="hidden sm:flex" style={{ width: 384, flexDirection: 'column', ... }}>...</div>}
{/* mobile */}
{open && <div className="flex sm:hidden" style={{ position: 'fixed', inset: 0, zIndex: 50, flexDirection: 'column', ... }}>...</div>}
```

Do NOT use `useMediaQuery` — SSR hydration flicker. Do NOT set `display` in `style={{}}` on either div.

### Mobile nav drawer

`AppNav` manages its own `navOpen` state. On mobile: `position: fixed`, slides in via `transition-transform`. On desktop: `sm:static`, normal sidebar. The layout server component (`src/app/(app)/layout.tsx`) needs `pt-12 sm:pt-0` on `<main>` to clear the fixed hamburger button.

The hamburger (open) and X (close) buttons both use `className="flex sm:hidden"` — no `display` in their style props.

### Supabase error handling

Always destructure `{ data, error }` from Supabase calls. Guard state updates behind `if (!error)`. For inserts, early-return on `error || !data`.

## Linting Rules

- `npx tsc --noEmit` must pass with zero errors
- `npx eslint src --max-warnings=0` must pass (no warnings)
- Never leave unused imports, unused variables, or `any` props where canonical types exist
- `react-hooks/exhaustive-deps` — if a `|| []` fallback is in deps, either move it inside the hook or reference the underlying stable value in deps

## After Every Commit

Check if a Linear issue exists for the work. If the task maps to open work in the Linear project, update the issue state. Team key is `DAT`.
