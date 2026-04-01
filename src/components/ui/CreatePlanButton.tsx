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

    // Create the 3 life plan stubs
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
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
    >
      <Plus className="w-4 h-4" />
      {loading ? 'Creating...' : label}
    </button>
  )
}
