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
  lifePlanId: string
  lifePlanType: LifePlanType
  messages: Message[]
}

const LIFE_TYPE_CONTEXT: Record<LifePlanType, string> = {
  expected: 'Life One — the path the user is already on. Help them think more clearly and ambitiously about what they are already building.',
  alternative: 'Life Two — what they would do if Life One disappeared tomorrow. Encourage genuine divergence; challenge them if they are just tweaking their current path.',
  wildcard: "Life Three — if money, status, and other people's opinions were no obstacle. Push them to be truly expansive and honest about what they actually want.",
}

function buildSystemPrompt(
  lifePlanType: LifePlanType,
  plan: {
    title: string
    questions: string[]
    gauge_resources: number
    gauge_likeability: number
    gauge_confidence: number
    gauge_coherence: number
    milestones: { year: number; title: string; category: string }[]
  }
): string {
  const milestoneLines = plan.milestones.length
    ? plan.milestones
        .sort((a, b) => a.year - b.year)
        .map(m => `  Year ${m.year} — ${m.title} [${m.category}]`)
        .join('\n')
    : '  (no milestones set yet)'

  const questionLines = plan.questions.filter(q => q.trim()).length
    ? plan.questions.filter(q => q.trim()).map(q => `  - ${q}`).join('\n')
    : '  (no guiding questions set yet)'

  return `You are an AI guide helping a user work through the "Designing Your Life" Odyssey Plan methodology. Your role is to help them think more clearly, honestly, and expansively about their life path — not to give generic advice.

This conversation is about their ${LIFE_TYPE_CONTEXT[lifePlanType]}

## Their current plan

**Title:** ${plan.title || '(untitled)'}

**Guiding questions:**
${questionLines}

**Dashboard gauges (0–100):**
  - Resources (financial/time viability): ${plan.gauge_resources}
  - Likeability (how much they want it): ${plan.gauge_likeability}
  - Confidence (belief they can do it): ${plan.gauge_confidence}
  - Coherence (does it feel like me): ${plan.gauge_coherence}

**5-year milestones:**
${milestoneLines}

## How to guide

- Ask pointed questions more than you give answers
- Reference their specific plan details when relevant — don't be generic
- If gauges are misaligned (e.g. high likeability but low resources), surface that tension
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

  const { lifePlanId, lifePlanType, messages } = body
  if (!lifePlanId || !lifePlanType || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'missing required fields' }, { status: 400 })
  }

  // fetch life plan — scoped through odyssey_plan to enforce user ownership
  const { data: plan, error: planError } = await supabase
    .from('life_plans')
    .select(`
      title,
      questions,
      gauge_resources,
      gauge_likeability,
      gauge_confidence,
      gauge_coherence,
      odyssey_plans!inner ( user_id ),
      milestones ( year, title, category )
    `)
    .eq('id', lifePlanId)
    .eq('odyssey_plans.user_id', user.id)
    .single()

  if (planError || !plan) {
    return NextResponse.json({ error: 'plan not found' }, { status: 404 })
  }

  const systemPrompt = buildSystemPrompt(lifePlanType, {
    title: plan.title,
    questions: (plan.questions as string[]) ?? [],
    gauge_resources: plan.gauge_resources,
    gauge_likeability: plan.gauge_likeability,
    gauge_confidence: plan.gauge_confidence,
    gauge_coherence: plan.gauge_coherence,
    milestones: (plan.milestones as { year: number; title: string; category: string }[]) ?? [],
  })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ message: text })
}
