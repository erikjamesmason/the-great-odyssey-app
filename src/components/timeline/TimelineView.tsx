'use client'

import { LIFE_PLAN_LABELS, MILESTONE_CATEGORY_LABELS, type LifePlanType, type MilestoneCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TimelineViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  odysseyPlan: any
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']

const colorMap: Record<LifePlanType, { bg: string; border: string; text: string; dot: string }> = {
  expected: { bg: 'bg-indigo-950/50', border: 'border-indigo-800', text: 'text-indigo-300', dot: 'bg-indigo-500' },
  alternative: { bg: 'bg-emerald-950/50', border: 'border-emerald-800', text: 'text-emerald-300', dot: 'bg-emerald-500' },
  wildcard: { bg: 'bg-amber-950/50', border: 'border-amber-800', text: 'text-amber-300', dot: 'bg-amber-500' },
}

const categoryColors: Partial<Record<MilestoneCategory, string>> = {
  career: 'bg-blue-900/60 text-blue-300 border-blue-800',
  personal: 'bg-purple-900/60 text-purple-300 border-purple-800',
  education: 'bg-cyan-900/60 text-cyan-300 border-cyan-800',
  travel: 'bg-teal-900/60 text-teal-300 border-teal-800',
  relationship: 'bg-pink-900/60 text-pink-300 border-pink-800',
  health: 'bg-green-900/60 text-green-300 border-green-800',
  finance: 'bg-yellow-900/60 text-yellow-300 border-yellow-800',
  other: 'bg-stone-800 text-stone-400 border-stone-700',
}

export default function TimelineView({ odysseyPlan }: TimelineViewProps) {
  const lifePlans = odysseyPlan.life_plans || []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Timeline — {odysseyPlan.name}</h2>
        <p className="text-stone-400 text-sm mt-1">All three lives, side by side across five years.</p>
      </div>

      {/* Year headers row */}
      <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-3 mb-4">
        <div />
        {PLAN_TYPES.map(type => {
          const lp = lifePlans.find((l: { type: string }) => l.type === type)
          const meta = LIFE_PLAN_LABELS[type]
          const c = colorMap[type]
          return (
            <div key={type} className={cn('rounded-xl border px-4 py-3 text-center', c.bg, c.border)}>
              <div className={cn('text-xs font-bold mb-0.5', c.text)}>{meta.label}</div>
              <div className="text-sm font-semibold truncate">{lp?.title || <span className="text-stone-500 italic font-normal">Untitled</span>}</div>
            </div>
          )
        })}
      </div>

      {/* Year rows */}
      {[1, 2, 3, 4, 5].map(year => (
        <div key={year} className="grid grid-cols-[140px_1fr_1fr_1fr] gap-3 mb-3">
          {/* Year label */}
          <div className="flex items-start pt-3">
            <div className="text-xs font-bold text-stone-500 bg-stone-800 rounded-full px-3 py-1">
              Year {year}
            </div>
          </div>

          {/* Milestones per life plan */}
          {PLAN_TYPES.map(type => {
            const lp = lifePlans.find((l: { type: string }) => l.type === type)
            const c = colorMap[type]
            const yearMilestones = (lp?.milestones || []).filter(
              (m: { year: number }) => m.year === year
            )
            return (
              <div
                key={type}
                className={cn(
                  'min-h-[80px] rounded-xl border p-3 space-y-2',
                  c.bg,
                  c.border
                )}
              >
                {yearMilestones.length === 0 ? (
                  <p className="text-xs text-stone-700 italic">—</p>
                ) : (
                  yearMilestones.map((m: { id: string; title: string; category: MilestoneCategory; description: string }) => (
                    <div key={m.id} className="group">
                      <div className="flex items-start gap-2">
                        <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', c.dot)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug">{m.title}</p>
                          <span className={cn(
                            'inline-block text-xs border rounded-full px-2 py-0.5 mt-1',
                            categoryColors[m.category] || categoryColors.other
                          )}>
                            {MILESTONE_CATEGORY_LABELS[m.category]}
                          </span>
                          {m.description && (
                            <p className="text-xs text-stone-500 mt-1 leading-relaxed hidden group-hover:block">
                              {m.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* Dashboard comparison */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-stone-400 mb-4 uppercase tracking-wider">Dashboard Comparison</h3>
        <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-3">
          <div />
          {PLAN_TYPES.map(type => {
            const lp = lifePlans.find((l: { type: string }) => l.type === type)
            const c = colorMap[type]
            const gauges = [
              { label: 'Resources', value: lp?.gauge_resources ?? 0 },
              { label: 'Likeability', value: lp?.gauge_likeability ?? 0 },
              { label: 'Confidence', value: lp?.gauge_confidence ?? 0 },
              { label: 'Coherence', value: lp?.gauge_coherence ?? 0 },
            ]
            return (
              <div key={type} className={cn('rounded-xl border p-4 space-y-3', c.bg, c.border)}>
                {gauges.map(g => (
                  <div key={g.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-stone-400">{g.label}</span>
                      <span className={c.text}>{g.value}</span>
                    </div>
                    <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', c.dot)}
                        style={{ width: `${g.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
