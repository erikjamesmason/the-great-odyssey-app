<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# The Great Odyssey — Agent Context

## What This Is

A life-planning web app based on the "Designing Your Life" / Odyssey Plan methodology. Users create three parallel 5-year life plans (Life I/II/III), map milestones, rate each plan on four gauges, and prototype paths with small experiments. An AI guide assists per life plan.

## Tech Stack

- **Framework**: Next.js 16 App Router (`src/app/`)
- **Auth + DB**: Supabase (client at `src/lib/supabase/`, types at `src/lib/types/index.ts`)
- **Styling**: Quiet Ledger design system (see below) — Tailwind for layout only
- **Icons**: Lucide React — always `style={{ width: N, height: N }}`, never `className` for sizing
- **Flow canvas**: `@xyflow/react` (ReactFlow) in `RoadmapView`
- **Fonts**: Inter (body) + Caveat (accent/year labels) via Google Fonts in `globals.css`
- **Linear**: https://linear.app/data-data/project/the-great-odyssey-295f5d572761

## File Structure

```
src/
  app/
    (auth)/login/       — login page
    (auth)/signup/      — signup page
    (app)/              — authenticated shell
      page.tsx          — dashboard (frontispiece layout)
      plans/[id]/       — plan workspace (wizard, timeline, roadmap, prototype, AI)
  components/
    nav/                — AppNav (sidebar), PlanTabNav (plan-level tabs)
    wizard/             — WizardShell, LifePlanEditor, DashboardGauges, MilestoneCard
    timeline/           — TimelineView
    roadmap/            — RoadmapView
    prototype/          — PrototypeView
    ai-guide/           — AiGuide
  lib/
    types/index.ts      — canonical types (OdysseyPlan, LifePlan, Milestone, Prototype, etc.)
    supabase/           — client.ts + server.ts
```

## Quiet Ledger (QL) Design System

**All visual styling must use inline `style={{}}` with CSS variables. No Tailwind color, shape, or shadow classes.**

Tailwind is permitted only for layout: `flex`, `h-full`, `flex-col`, `flex-1`, `overflow-auto`, `hidden`, `sm:inline`, etc.

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

### Life Type → Color Mapping

Always map life plan types to QL accent colors like this:

```ts
const QL_COLORS: Record<LifePlanType, string> = {
  expected:    'var(--ql-l1)',
  alternative: 'var(--ql-l2)',
  wildcard:    'var(--ql-l3)',
}
```

### Design Rules

- **No rounded corners** — `borderRadius: 0` everywhere, never `borderRadius: 4` or similar
- **No shadows** — never `boxShadow`
- **Hairline borders only** — `1px solid var(--ql-rule)` or `1px solid <accent-color>`
- **Ink-filled buttons** — primary actions: `background: 'var(--ql-ink)', color: 'var(--ql-paper)'`
- **Outlined secondary buttons** — `background: 'none', border: '1px solid var(--ql-rule)'`
- **Caveat font** — year labels, volume markers: `fontFamily: "'Caveat', cursive"`
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

### Gauge columns are FLAT, not nested

The `LifePlan` canonical type and the DB both use flat columns:

```ts
gauge_resources: number
gauge_likeability: number
gauge_confidence: number
gauge_coherence: number
```

Never access `lifePlan.gauges.resources` — that shape does not exist in the DB. Always use `lifePlan.gauge_resources` etc.

### Prototypes use `scheduled_date`, not `date`

The `Prototype` type and DB column is `scheduled_date: string | null` — not `date`.

### Milestone `position` is optional

`Milestone.position?: number` — the DB has it, but unsaved (new) milestones don't. Always use `?? 0` when sorting by position.

## React Patterns Used in This Codebase

### Stable list keys

Never use array index as key for lists that can be reordered or deleted. Use:
- Existing DB records: `key={item.id}`
- New unsaved records: `key={item.id ?? \`new-${item._clientKey}\`}` with a `useRef` counter

### Always-mounted panels

When two panels share a tab toggle, render both with `display: 'none'` / `display: 'flex'` rather than conditional rendering. Conditional rendering unmounts and destroys form state.

### Supabase error handling

Always destructure `{ data, error }` from Supabase calls. Guard state updates behind `if (!error)`. For inserts, early-return on `error || !data`.

## Linting Rules

- `npx tsc --noEmit` must pass with zero errors
- `npx eslint src --max-warnings=0` must pass (no warnings)
- Never leave unused imports, unused variables, or `any` props where canonical types exist
- `react-hooks/exhaustive-deps` — if a `|| []` fallback is in deps, either move it inside the hook or reference the underlying stable value in deps

## After Every Commit

Check if a Linear issue exists for the work. If the task maps to open work in the Linear project, update the issue state. Team key is `DAT`.
