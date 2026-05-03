'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'

interface CreatePlanButtonProps {
  label?: string
}

export default function CreatePlanButton({ label = 'New odyssey' }: CreatePlanButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: plan, error } = await supabase
      .from('odyssey_plans')
      .insert({ user_id: user.id, name: 'My Odyssey Plan' })
      .select()
      .single()

    if (error || !plan) { setLoading(false); return }

    await supabase.from('life_plans').insert([
      { odyssey_plan_id: plan.id, type: 'expected' },
      { odyssey_plan_id: plan.id, type: 'alternative' },
      { odyssey_plan_id: plan.id, type: 'wildcard' },
    ])

    router.push(`/plans/${plan.id}/wizard`)
  }

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: '1px solid var(--ql-ink)',
        padding: '8px 16px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: loading ? 'var(--ql-ink-faint)' : 'var(--ql-ink)',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Plus style={{ width: 13, height: 13 }} />
      {loading ? 'Creating…' : label}
    </button>
  )
}
