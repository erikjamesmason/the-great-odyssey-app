'use client'

import { QL_COLORS, LIFE_NUMERALS, LIFE_SEAL_IDS, MILESTONE_CATEGORY_LABELS, type LifePlanType, type OdysseyPlan, type Milestone } from '@/lib/types'
import { QLSeal, QLOrnament } from '@/components/ui/QLComponents'

interface RoadmapViewProps {
  odysseyPlan: OdysseyPlan
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']
const ROMAN_YEARS = ['I', 'II', 'III', 'IV', 'V']

export default function RoadmapView({ odysseyPlan }: RoadmapViewProps) {
  const lifePlans = odysseyPlan.life_plans || []
  const years = [1, 2, 3, 4, 5]

  return (
    <div style={{ padding: '24px 20px', maxWidth: 720, fontFamily: "'Inter', sans-serif" }}>
      {/* legend */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
        {PLAN_TYPES.map(type => {
          const lp = lifePlans.find((l: { type: string }) => l.type === type)
          const color = QL_COLORS[type]
          return (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <QLSeal id={LIFE_SEAL_IDS[type]} size={22} color={color} />
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color }}>
                {LIFE_NUMERALS[type]}
              </span>
              <span style={{ fontSize: 11, color: 'var(--ql-ink-faint)' }}>
                {lp?.title || 'Untitled'}
              </span>
            </div>
          )
        })}
      </div>

      <QLOrnament width={180} />

      {/* vertical timeline */}
      <div style={{ marginTop: 28 }}>
        {years.map((year, yi) => {
          const rowsWithMilestones = PLAN_TYPES.flatMap(type => {
            const lp = lifePlans.find((l: { type: string }) => l.type === type)
            const ms = (lp?.milestones || []).filter((m: Milestone) => m.year === year)
            return ms.map((m: Milestone) => ({ ...m, lifeType: type as LifePlanType }))
          })

          return (
            <div key={year} style={{ marginBottom: 32 }}>
              {/* year header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 28,
                  color: 'var(--ql-ink)',
                  minWidth: 32,
                  lineHeight: 1,
                }}>
                  {ROMAN_YEARS[yi]}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--ql-rule)' }} />
              </div>

              {rowsWithMilestones.length === 0 ? (
                <p style={{ paddingLeft: 44, fontSize: 12, color: 'var(--ql-ink-faint)', fontStyle: 'italic', margin: 0 }}>
                  No milestones yet.
                </p>
              ) : (
                <div style={{ paddingLeft: 44, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {rowsWithMilestones.map(m => {
                    const color = QL_COLORS[m.lifeType]
                    return (
                      <div key={m.id} style={{
                        padding: '8px 12px',
                        borderLeft: `2px solid ${color}`,
                        background: 'var(--ql-paper-deep)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color, opacity: 0.8 }}>
                            {LIFE_NUMERALS[m.lifeType]}
                          </span>
                          <span style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)' }}>
                            {MILESTONE_CATEGORY_LABELS[m.category]}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--ql-ink)' }}>{m.title}</div>
                        {m.description && (
                          <div style={{ fontSize: 12, color: 'var(--ql-ink-faint)', fontStyle: 'italic', marginTop: 3 }}>
                            {m.description}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
