import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lifePlanId, lifePlanType, messages } = await request.json()

  // Fetch the life plan context
  const { data: lifePlan } = await supabase
    .from('life_plans')
    .select('*, milestones(*), odyssey_plans(name)')
    .eq('id', lifePlanId)
    .single()

  const typeLabels: Record<string, string> = {
    expected: 'Life One (The Expected Path — your current trajectory)',
    alternative: 'Life Two (The Alternative Path — if Life One disappeared)',
    wildcard: 'Life Three (The Wild Card — if money and image were no obstacle)',
  }

  const systemPrompt = `You are an empathetic and insightful Odyssey Plan guide, helping a user design their life using design thinking principles from "Designing Your Life" by Bill Burnett and Dave Evans.

The user is currently working on: ${typeLabels[lifePlanType] || lifePlanType}

Current plan state:
- Title: "${lifePlan?.title || 'Not yet titled'}"
- Questions this life answers: ${lifePlan?.questions?.join('; ') || 'Not yet written'}
- Milestones: ${lifePlan?.milestones?.length || 0} milestones across 5 years
- Dashboard gauges: Resources ${lifePlan?.gauge_resources}/100, Likeability ${lifePlan?.gauge_likeability}/100, Confidence ${lifePlan?.gauge_confidence}/100, Coherence ${lifePlan?.gauge_coherence}/100

Your role:
1. Ask thoughtful questions that help the user explore and deepen this life path
2. Suggest specific, concrete milestone ideas they might not have considered
3. Help them write a compelling, evocative title (3-6 words)
4. Point out tensions in their dashboard (e.g., high likeability but low resources) and help them think through bridging that gap
5. Break ambitious dreams into small, manageable first steps
6. Be encouraging but honest — if a plan seems vague, gently push for specificity
7. Reference the "Designing Your Life" framework naturally when helpful

Keep responses concise (2-4 short paragraphs max) and conversational. Don't be preachy.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  })

  const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''

  // Persist messages to DB
  if (lifePlanId) {
    const lastUserMsg = messages[messages.length - 1]
    if (lastUserMsg?.role === 'user') {
      await supabase.from('ai_messages').insert([
        { life_plan_id: lifePlanId, role: 'user', content: lastUserMsg.content },
        { life_plan_id: lifePlanId, role: 'assistant', content: assistantMessage },
      ])
    }
  }

  return NextResponse.json({ message: assistantMessage })
}
