import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Compass } from 'lucide-react'
import CreatePlanButton from '@/components/ui/CreatePlanButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: plans } = await supabase
    .from('odyssey_plans')
    .select('*, life_plans(id, type, title, gauge_resources, gauge_likeability, gauge_confidence, gauge_coherence)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold">Your Odysseys</h1>
          <p className="text-stone-400 text-sm mt-1">Each odyssey contains three radically different life plans.</p>
        </div>
        <CreatePlanButton />
      </div>

      {!plans || plans.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-stone-700 rounded-2xl">
          <Compass className="w-10 h-10 text-stone-600 mx-auto mb-4" />
          <h2 className="font-semibold text-lg mb-2">No odysseys yet</h2>
          <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto">
            Start by creating your first Odyssey Plan — three possible futures waiting to be imagined.
          </p>
          <CreatePlanButton label="Create your first odyssey" />
        </div>
      ) : (
        <div className="grid gap-4">
          {plans.map(plan => (
            <Link
              key={plan.id}
              href={`/plans/${plan.id}/wizard`}
              className="block bg-stone-900 border border-stone-800 hover:border-stone-600 rounded-2xl p-6 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-lg group-hover:text-indigo-300 transition-colors">{plan.name}</h2>
                  <p className="text-stone-500 text-xs mt-0.5">
                    Created {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs text-stone-500 border border-stone-700 rounded-full px-3 py-1">
                  {plan.life_plans?.length ?? 0}/3 lives
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['expected', 'alternative', 'wildcard'] as const).map(type => {
                  const lp = plan.life_plans?.find((l: { type: string }) => l.type === type)
                  const colors = { expected: 'indigo', alternative: 'emerald', wildcard: 'amber' }
                  const labels = { expected: 'Life One', alternative: 'Life Two', wildcard: 'Life Three' }
                  const color = colors[type]
                  return (
                    <div key={type} className={`bg-stone-800/50 rounded-xl p-3 border border-stone-700`}>
                      <span className={`text-xs font-medium text-${color}-400`}>{labels[type]}</span>
                      <p className="text-sm mt-1 text-stone-300 truncate">
                        {lp?.title || <span className="text-stone-500 italic">Not started</span>}
                      </p>
                    </div>
                  )
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
