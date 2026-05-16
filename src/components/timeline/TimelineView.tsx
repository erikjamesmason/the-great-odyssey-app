'use client'

import { useState } from 'react'
import { MILESTONE_CATEGORY_LABELS, LIFE_NUMERALS, LIFE_SEAL_IDS, QL_COLORS, HAND_LABELS, type LifePlanType, type Milestone, type OdysseyPlan } from '@/lib/types'
import { QLSeal, QLOrnament, QLTicks } from '@/components/ui/QLComponents'

interface TimelineViewProps {
  odysseyPlan: OdysseyPlan
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']
const ROMAN_YEARS = ['I', 'II', 'III', 'IV', 'V']

function MilestoneRow({ ms, color }: { ms: Milestone; color: string }) {
  return (
    <div style={{ padding: '6px 0', borderBottom: '1px solid var(--ql-rule)' }}>
      <span style={{
        display: 'block',
        fontSize: 9,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--ql-ink-faint)',
        fontFamily: "'Inter', sans-serif",
        marginBottom: 2,
      }}>
        {MILESTONE_CATEGORY_LABELS[ms.category]}
      </span>
      <span style={{ fontSize: 12, color: 'var(--ql-ink)', fontFamily: "'Inter', sans-serif" }}>
        {ms.title}
      </span>
      {ms.description && (
        <span style={{ display: 'block', fontSize: 11, color: 'var(--ql-ink-faint)', fontStyle: 'italic', marginTop: 2 }}>
          {ms.description}
        </span>
      )}
    </div>
  )
}

export default function TimelineView({ odysseyPlan }: TimelineViewProps) {
  const lifePlans = odysseyPlan.life_plans || []
  const [activeType, setActiveType] = useState<LifePlanType>('expected')

  return (
    <div style={{ padding: '24px 20px', fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop: foldout grid */}
      <div className="hidden sm:block">
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1fr 1fr', marginBottom: 24 }}>
          <div />
          {PLAN_TYPES.map(type => {
            const lp = lifePlans.find((l: { type: string }) => l.type === type)
            const color = QL_COLORS[type]
            return (
              <div key={type} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 8px 16px',
                borderBottom: `2px solid ${color}`,
              }}>
                <QLSeal id={LIFE_SEAL_IDS[type]} size={36} color={color} />
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color }}>
                  {LIFE_NUMERALS[type]}
                </div>
                <div style={{ fontSize: 10, fontStyle: 'italic', color: 'var(--ql-ink-faint)', textAlign: 'center' }}>
                  {HAND_LABELS[type]}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ql-ink)', textAlign: 'center', marginTop: 2 }}>
                  {lp?.title || <span style={{ color: 'var(--ql-ink-faint)', fontStyle: 'italic' }}>Untitled</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Year rows */}
        {[1, 2, 3, 4, 5].map(year => (
          <div key={year} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1fr 1fr', marginBottom: 4 }}>
            {/* year label */}
            <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 8 }}>
              <span style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 24,
                color: 'var(--ql-ink)',
              }}>
                {ROMAN_YEARS[year - 1]}
              </span>
            </div>

            {PLAN_TYPES.map(type => {
              const lp = lifePlans.find((l: { type: string }) => l.type === type)
              const color = QL_COLORS[type]
              const yearMilestones = (lp?.milestones || []).filter((ms: Milestone) => ms.year === year)
              return (
                <div key={type} style={{
                  minHeight: 72,
                  borderLeft: `1px solid var(--ql-rule)`,
                  borderBottom: `1px solid var(--ql-rule)`,
                  padding: '8px 12px',
                }}>
                  {yearMilestones.length === 0
                    ? <span style={{ fontSize: 11, color: 'var(--ql-ink-faint)', fontStyle: 'italic' }}>—</span>
                    : yearMilestones.map((ms: Milestone) => <MilestoneRow key={ms.id} ms={ms} color={color} />)
                  }
                </div>
              )
            })}
          </div>
        ))}

        {/* Gauge comparison */}
        <div style={{ marginTop: 40 }}>
          <QLOrnament width={200} />
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', margin: '16px 0 12px' }}>
            Dashboard
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1fr 1fr', gap: 0 }}>
            <div />
            {PLAN_TYPES.map(type => {
              const lp = lifePlans.find((l: { type: string }) => l.type === type)
              const color = QL_COLORS[type]
              const gaugeRows = [
                { label: 'Resources',   value: lp?.gauge_resources   ?? 0 },
                { label: 'Likeability', value: lp?.gauge_likeability ?? 0 },
                { label: 'Confidence',  value: lp?.gauge_confidence  ?? 0 },
                { label: 'Coherence',   value: lp?.gauge_coherence   ?? 0 },
              ]
              return (
                <div key={type} style={{ padding: '12px 12px', borderLeft: '1px solid var(--ql-rule)' }}>
                  {gaugeRows.map(g => (
                    <div key={g.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)' }}>
                          {g.label}
                        </span>
                        <span style={{ fontFamily: "'Caveat', cursive", fontSize: 13, color }}>
                          {g.value}
                        </span>
                      </div>
                      <QLTicks value={g.value} color={color} />
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile: life selector + single-life view */}
      <div className="sm:hidden">
        <div style={{ display: 'flex', marginBottom: 20, borderBottom: '1px solid var(--ql-rule)' }}>
          {PLAN_TYPES.map(type => {
            const color = QL_COLORS[type]
            const isActive = activeType === type
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <QLSeal id={LIFE_SEAL_IDS[type]} size={24} color={color} />
                <span style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 14,
                  color: isActive ? color : 'var(--ql-ink-faint)',
                }}>
                  {LIFE_NUMERALS[type]}
                </span>
              </button>
            )
          })}
        </div>

        {(() => {
          const lp = lifePlans.find((l: { type: string }) => l.type === activeType)
          const color = QL_COLORS[activeType]
          return (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color, marginBottom: 2 }}>
                  {LIFE_NUMERALS[activeType]} — {HAND_LABELS[activeType]}
                </div>
                <div style={{ fontSize: 14, color: 'var(--ql-ink)' }}>
                  {lp?.title || <span style={{ color: 'var(--ql-ink-faint)', fontStyle: 'italic' }}>Untitled</span>}
                </div>
              </div>

              {[1, 2, 3, 4, 5].map(year => {
                const yearMilestones = (lp?.milestones || []).filter((ms: Milestone) => ms.year === year)
                return (
                  <div key={year} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: 'var(--ql-ink)', minWidth: 24, paddingTop: 4 }}>
                      {ROMAN_YEARS[year - 1]}
                    </span>
                    <div style={{ flex: 1, borderLeft: '1px solid var(--ql-rule)', paddingLeft: 12 }}>
                      {yearMilestones.length === 0
                        ? <span style={{ fontSize: 11, color: 'var(--ql-ink-faint)', fontStyle: 'italic' }}>—</span>
                        : yearMilestones.map((ms: Milestone) => <MilestoneRow key={ms.id} ms={ms} color={color} />)
                      }
                    </div>
                  </div>
                )
              })}
            </>
          )
        })()}
      </div>
    </div>
  )
}
