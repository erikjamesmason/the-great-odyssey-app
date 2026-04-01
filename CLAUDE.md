# The Great Odyssey App — CLAUDE.md

## What This App Is

A life-planning tool inspired by *Designing Your Life* (Bill Burnett & Dave Evans). Users create **Odyssey Plans** — each containing exactly three **Life Plans** (Life One: expected path, Life Two: alternative path, Life Three: wildcard). Each life plan has a title, guiding questions, a 5-year milestone timeline, and four self-assessment gauges. An AI guide (Claude) helps users develop their plans conversationally.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16.2.2 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 + `clsx`/`tailwind-merge` |
| UI primitives | Radix UI, Lucide React, @xyflow/react |
| Backend/Auth/DB | Supabase (Postgres + Row Level Security + SSR auth) |
| AI | Anthropic SDK (`claude-sonnet-4-6`) |
| State | Zustand (installed; React local state used predominantly) |
| Package manager | npm |

> **IMPORTANT (from AGENTS.md):** This Next.js version has breaking changes from older versions. Before writing any Next.js-specific code, check `node_modules/next/dist/docs/` for the current API. Do not rely on pre-training knowledge of Next.js conventions.

---

## Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (eslint-config-next core-web-vitals + typescript)
```

No test suite is configured.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=      # Service role key (server-only, never expose to client)
ANTHROPIC_API_KEY=              # Anthropic API key (server-only)
NEXT_PUBLIC_APP_URL=            # e.g. http://localhost:3000
```

---

## Project Structure

```
src/
  app/
    (app)/                        # Authenticated route group
      dashboard/page.tsx          # List all odyssey plans
      plans/[id]/
        layout.tsx                # Fetches plan, shows PlanTabNav
        wizard/page.tsx           # Life plan editor (WizardShell)
        roadmap/page.tsx          # Roadmap view
        timeline/page.tsx         # Timeline view
        prototype/page.tsx        # Prototype/experiment tracker
    (auth)/
      login/page.tsx
      signup/page.tsx
    api/
      ai/route.ts                 # POST — AI chat endpoint (Anthropic)
    layout.tsx                    # Root layout
    page.tsx                      # Landing/root page
    globals.css                   # Tailwind base styles

  components/
    ai-guide/AiGuide.tsx          # Chat UI; calls /api/ai
    prototype/PrototypeView.tsx
    roadmap/RoadmapView.tsx
    timeline/TimelineView.tsx
    ui/
      AppNav.tsx                  # Sidebar nav (authenticated)
      CreatePlanButton.tsx        # Client component — creates odyssey plan + 3 life plans
      PlanTabNav.tsx              # Tab bar: Wizard / Roadmap / Timeline / Prototype
    wizard/
      WizardShell.tsx             # Client — tabs across 3 life plan types + AI panel toggle
      LifePlanEditor.tsx          # Client — 4-step form: title → questions → milestones → gauges
      MilestoneCard.tsx           # Individual milestone edit card
      DashboardGauges.tsx         # Four 0-100 sliders (resources, likeability, confidence, coherence)

  lib/
    supabase/
      client.ts                   # Browser Supabase client (use in Client Components)
      server.ts                   # Server Supabase client (use in Server Components / Route Handlers)
      middleware.ts               # Session refresh helper
    types/index.ts                # All shared TypeScript types and label constants
    utils.ts                      # cn() — clsx + tailwind-merge helper

  middleware.ts                   # Runs on every non-static request; refreshes Supabase session

supabase/
  migrations/001_initial_schema.sql   # Full DB schema + RLS policies
```

---

## Database Schema

All tables use UUIDs. Row Level Security is enabled on every table — users can only access their own data.

```
odyssey_plans       id, user_id (→ auth.users), name, created_at, updated_at
life_plans          id, odyssey_plan_id, type (expected|alternative|wildcard),
                    title, questions (text[]),
                    gauge_resources, gauge_likeability, gauge_confidence, gauge_coherence (0-100 int),
                    created_at, updated_at
milestones          id, life_plan_id, year (1-5), title, description,
                    category, position, created_at
prototypes          id, life_plan_id, type (experiment|interview|course|side_project),
                    title, description, status (planned|in_progress|completed|abandoned),
                    scheduled_date, notes, created_at, updated_at
ai_messages         id, life_plan_id, role (user|assistant), content, created_at
```

`updated_at` columns are auto-maintained by a Postgres trigger (`update_updated_at()`).

---

## Authentication

Supabase SSR auth with cookie-based sessions.

- `src/lib/supabase/server.ts` — use in Server Components and Route Handlers
- `src/lib/supabase/client.ts` — use in Client Components (`'use client'`)
- `src/middleware.ts` — refreshes the session token on every request
- The `(app)` layout redirects unauthenticated users to `/login`
- Route Handlers check `supabase.auth.getUser()` before processing

Never use the server client in Client Components or the browser client in Server Components.

---

## AI Integration

`POST /api/ai` — authenticated endpoint.

- Accepts `{ lifePlanId, lifePlanType, messages[] }`
- Fetches current life plan state from Supabase for context
- Calls `claude-sonnet-4-6` with a system prompt framed around the *Designing Your Life* framework
- Persists both the user message and assistant response to `ai_messages`
- Returns `{ message: string }`

The `AiGuide` component manages local message state and calls this endpoint. It does not pre-load history from `ai_messages` on mount (history is write-only from the client perspective in the current implementation).

---

## Key Conventions

### TypeScript
- Strict mode enabled; avoid `any` (existing uses are marked with `// eslint-disable-next-line @typescript-eslint/no-explicit-any`)
- Path alias `@/*` maps to `src/*` — always use this for imports within `src/`
- All shared types live in `src/lib/types/index.ts`

### Components
- Server Components by default; add `'use client'` only when needed (event handlers, hooks, browser APIs)
- Data fetching happens in Server Components (layouts and pages) and is passed as props to Client Components
- Client Components that need Supabase use the browser client directly (no API abstraction layer)

### Styling
- Dark theme throughout: `stone-*` color scale for neutrals
- Three life plan accent colors: `indigo` (Life One/expected), `emerald` (Life Two/alternative), `amber` (Life Three/wildcard)
- Use `cn()` from `src/lib/utils.ts` for conditional class merging
- Tailwind v4 — avoid Tailwind v3 syntax differences

### Data Mutations
- Client Components call Supabase directly via the browser client
- No server actions or dedicated mutation API routes (except `/api/ai`)
- Saves in `LifePlanEditor` are explicit (user clicks "Save") — not auto-save

### File Naming
- PascalCase for component files (`WizardShell.tsx`)
- camelCase for lib/utility files (`client.ts`, `utils.ts`)
- kebab-case for route segments (`ai-guide/`)

---

## Important Notes for AI Assistants

1. **Read Next.js docs from `node_modules/next/dist/docs/`** before writing Next.js code — this version may differ from training data.
2. **`params` in layouts/pages is a `Promise`** — always `await params` before destructuring (see `plans/[id]/layout.tsx:11`).
3. **No test framework** — do not attempt to run tests.
4. **Supabase client selection matters** — wrong client (server vs browser) in the wrong context will cause runtime errors.
5. **RLS is enforced at the DB level** — the `service_role` key bypasses RLS; only use it intentionally for admin operations.
6. **Tailwind dynamic classes** — Tailwind v4 with JIT requires complete class strings (e.g. `text-indigo-400`), not dynamically constructed partials.
