import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { type LifePlanType } from '@/lib/types'

const anthropic = new Anthropic()

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  planId: string
  activeLifeType?: LifePlanType
  messages: Message[]
}

const LIFE_LABELS: Record<LifePlanType, string> = {
  expected: "Life I — the path I'm on",
  alternative: 'Life II — if it disappeared',
  wildcard: 'Life III — no obstacle',
}

const LIFE_CONTEXT: Record<LifePlanType, string> = {
  expected: 'Help them think more clearly and ambitiously about what they are already building.',
  alternative: 'Encourage genuine divergence; challenge them if they are just tweaking their current path.',
  wildcard: 'Push them to be truly expansive and honest about what they actually want.',
}

const STATUS_LABELS: Record<string, string> = {
  planned: 'planned', in_progress: 'underway', completed: 'done', abandoned: 'let go',
}

const TYPE_LABELS: Record<string, string> = {
  experiment: 'experiment', interview: 'conversation', course: 'study', side_project: 'side project',
}

interface LifePlanRow {
  type: string
  title: string
  questions: string[]
  gauge_resources: number
  gauge_likeability: number
  gauge_confidence: number
  gauge_coherence: number
  milestones: Array<{ year: number; title: string; category: string }>
  prototypes: Array<{ type: string; title: string; description: string; status: string }>
}

interface PlanRow {
  name: string
  life_plans: LifePlanRow[]
  plan_reflections: Array<{ text: string; created_at: string }>
}

function buildSystemPrompt(activeLifeType: LifePlanType | undefined, plan: PlanRow): string {
  const lifeSections = (plan.life_plans ?? []).map(lp => {
    const type = lp.type as LifePlanType
    const label = LIFE_LABELS[type] ?? lp.type

    const milestoneLines = (lp.milestones ?? []).length
      ? [...(lp.milestones ?? [])].sort((a, b) => a.year - b.year)
          .map(m => `  Year ${m.year} — ${m.title} [${m.category}]`).join('\n')
      : '  (none yet)'

    const questionLines = (lp.questions ?? []).filter(q => q.trim()).length
      ? (lp.questions ?? []).filter(q => q.trim()).map(q => `  - ${q}`).join('\n')
      : '  (none)'

    return `### ${label}
Title: ${lp.title || '(untitled)'}
Guiding questions:
${questionLines}
Dashboard (0–100): resources ${lp.gauge_resources}, likeability ${lp.gauge_likeability}, confidence ${lp.gauge_confidence}, coherence ${lp.gauge_coherence}
5-year milestones:
${milestoneLines}`
  }).join('\n\n')

  const prototypeLines = (plan.life_plans ?? []).flatMap(lp =>
    (lp.prototypes ?? []).map(p => {
      const label = LIFE_LABELS[lp.type as LifePlanType] ?? lp.type
      const desc = p.description ? ` — "${p.description}"` : ''
      return `  [${label}] ${TYPE_LABELS[p.type] ?? p.type}: "${p.title}" (${STATUS_LABELS[p.status] ?? p.status})${desc}`
    })
  )
  const prototypesSection = prototypeLines.length ? prototypeLines.join('\n') : '  (none yet)'

  const sortedReflections = [...(plan.plan_reflections ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12)
  const reflectionLines = sortedReflections.map(r => {
    const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `  ${date}: ${r.text}`
  }).join('\n')
  const reflectionsSection = reflectionLines || '  (none yet)'

  const activeContext = activeLifeType
    ? `The user is currently focused on ${LIFE_LABELS[activeLifeType]}. ${LIFE_CONTEXT[activeLifeType]}`
    : 'The user is reviewing their plan broadly — not focused on one specific life.'

  return `You are an AI guide helping a user work through the "Designing Your Life" Odyssey Plan methodology. Your role is to help them think more clearly, honestly, and expansively — not to give generic advice.

You have full context of all three of their life plans, their prototypes (small experiments), and their marginalia notes.

## Plan: ${plan.name}

## The three lives

${lifeSections}

## Prototypes (experiments and conversations)

${prototypesSection}

## Marginalia (unstructured notes in the margin)

${reflectionsSection}

## Current context

${activeContext}

## How to guide

- Ask pointed questions more than you give answers
- Reference their specific plan details, prototypes, and marginalia when relevant — don't be generic
- Surface tensions: misaligned gauges, contradictions between lives, stalled prototypes, recurring themes in marginalia
- Be direct and honest; this is a thinking tool, not a cheerleader
- Keep responses focused — 2–4 short paragraphs max unless they ask for something detailed
- Use markdown sparingly: bullet lists are fine, headers are rarely needed`
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const { planId, activeLifeType, messages } = body
  if (!planId || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'missing required fields' }, { status: 400 })
  }

  const { data: plan, error: planError } = await supabase
    .from('odyssey_plans')
    .select(`
      name,
      life_plans (
        type,
        title,
        questions,
        gauge_resources,
        gauge_likeability,
        gauge_confidence,
        gauge_coherence,
        milestones (year, title, category),
        prototypes (type, title, description, status)
      ),
      plan_reflections (text, created_at)
    `)
    .eq('id', planId)
    .eq('user_id', user.id)
    .single()

  if (planError || !plan) {
    return NextResponse.json({ error: 'plan not found' }, { status: 404 })
  }

  const systemPrompt = buildSystemPrompt(activeLifeType, plan as PlanRow)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ message: text })
}
