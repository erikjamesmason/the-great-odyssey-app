'use client'

import { useState } from 'react'
import { MILESTONE_CATEGORY_LABELS, type LifePlanType, type Milestone, type OdysseyPlan } from '@/lib/types'

interface TimelineViewProps {
  odysseyPlan: OdysseyPlan
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']

const LIFE_META: Record<LifePlanType, { color: string; label: string }> = {
  expected:    { color: 'var(--ql-l1)', label: 'Life I' },
  alternative: { color: 'var(--ql-l2)', label: 'Life II' },
  wildcard:    { color: 'var(--ql-l3)', label: 'Life III' },
}

function MilestoneList({ milestones, color }: { milestones: Milestone[]; color: string }) {
  if (milestones.length === 0) {
    return <p style={{ fontSize: 11, color: 'var(--ql-ink-faint)', fontStyle: 'italic', margin: 0 }}>—</p>
  }
  return (
    <>
      {milestones.map((ms) => (
        <div key={ms.id} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ width: 6, height: 6, background: color, flexShrink: 0, marginTop: 6 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ql-ink)', margin: 0, lineHeight: 1.4 }}>
                {ms.title}
              </p>
              <span style={{
                display: 'inline-block',
                fontSize: 10,
                color: 'var(--ql-ink-faint)',
                border: '1px solid var(--ql-rule)',
                padding: '1px 6px',
                marginTop: 3,
              }}>
                {MILESTONE_CATEGORY_LABELS[ms.category]}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default function TimelineView({ odysseyPlan }: TimelineViewProps) {
  const lifePlans = odysseyPlan.life_plans || []
  const [activeType, setActiveType] = useState<LifePlanType>('expected')

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 400, color: 'var(--ql-ink)', margin: '0 0 4px' }}>
          Timeline — {odysseyPlan.name}
        </h2>
        <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', margin: 0 }}>
          All three lives, side by side across five years.
        </p>
      </div>

      {/* Desktop: 4-column grid */}
      <div className="hidden sm:block">
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', gap: 1, marginBottom: 1 }}>
          <div />
          {PLAN_TYPES.map(type => {
            const lp = lifePlans.find((l: { type: string }) => l.type === type)
            const m = LIFE_META[type]
            return (
              <div key={type} style={{
                borderLeft: `3px solid ${m.color}`,
                padding: '10px 14px',
                background: 'var(--ql-paper-deep)',
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: m.color, marginBottom: 2,
                }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ql-ink)' }}>
                  {lp?.title || <span style={{ color: 'var(--ql-ink-faint)', fontStyle: 'italic', fontWeight: 400 }}>Untitled</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Year rows */}
        {[1, 2, 3, 4, 5].map(year => (
          <div key={year} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', gap: 1, marginBottom: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 12 }}>
              <div style={{
                fontSize: 12,
                fontFamily: "'Caveat', cursive",
                color: 'var(--ql-ink-faint)',
                border: '1px solid var(--ql-rule)',
                padding: '2px 8px',
              }}>
                Year {year}
              </div>
            </div>
            {PLAN_TYPES.map(type => {
              const lp = lifePlans.find((l: { type: string }) => l.type === type)
              const m = LIFE_META[type]
              const yearMilestones = (lp?.milestones || []).filter((ms: Milestone) => ms.year === year)
              return (
                <div key={type} style={{
                  minHeight: 80,
                  border: '1px solid var(--ql-rule)',
                  padding: 10,
                  background: 'var(--ql-paper)',
                }}>
                  <MilestoneList milestones={yearMilestones} color={m.color} />
                </div>
              )
            })}
          </div>
        ))}

        {/* Dashboard comparison */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 16,
          }}>
            Dashboard Comparison
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', gap: 1 }}>
            <div />
            {PLAN_TYPES.map(type => {
              const lp = lifePlans.find((l: { type: string }) => l.type === type)
              const m = LIFE_META[type]
              const gauges = [
                { label: 'Resources',   value: lp?.gauge_resources   ?? 0 },
                { label: 'Likeability', value: lp?.gauge_likeability ?? 0 },
                { label: 'Confidence',  value: lp?.gauge_confidence  ?? 0 },
                { label: 'Coherence',   value: lp?.gauge_coherence   ?? 0 },
              ]
              return (
                <div key={type} style={{
                  border: '1px solid var(--ql-rule)',
                  padding: 14,
                  background: 'var(--ql-paper-deep)',
                }}>
                  {gauges.map(g => (
                    <div key={g.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ql-ink-faint)', marginBottom: 3 }}>
                        <span>{g.label}</span>
                        <span style={{ color: m.color }}>{g.value}</span>
                      </div>
                      <div style={{ height: 1, background: 'var(--ql-rule)', position: 'relative' }}>
                        <div style={{
                          position: 'absolute', left: 0, top: 0, height: 1,
                          width: `${g.value}%`, background: m.color,
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile: single-life stacked view */}
      <div className="sm:hidden">
        {/* Life selector tabs */}
        <div style={{ display: 'flex', gap: 1, marginBottom: 16 }}>
          {PLAN_TYPES.map(type => {
            const m = LIFE_META[type]
            const isActive = activeType === type
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: "'Inter', sans-serif",
                  cursor: 'pointer',
                  border: isActive ? `1px solid ${m.color}` : '1px solid var(--ql-rule)',
                  background: isActive ? m.color : 'none',
                  color: isActive ? 'var(--ql-paper)' : 'var(--ql-ink-faint)',
                }}
              >
                {m.label}
              </button>
            )
          })}
        </div>

        {/* Selected life content */}
        {(() => {
          const lp = lifePlans.find((l: { type: string }) => l.type === activeType)
          const m = LIFE_META[activeType]
          const gauges = [
            { label: 'Resources',   value: lp?.gauge_resources   ?? 0 },
            { label: 'Likeability', value: lp?.gauge_likeability ?? 0 },
            { label: 'Confidence',  value: lp?.gauge_confidence  ?? 0 },
            { label: 'Coherence',   value: lp?.gauge_coherence   ?? 0 },
          ]
          return (
            <>
              {/* Life header */}
              <div style={{
                borderLeft: `3px solid ${m.color}`,
                padding: '10px 14px',
                background: 'var(--ql-paper-deep)',
                marginBottom: 1,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: m.color, marginBottom: 2,
                }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ql-ink)' }}>
                  {lp?.title || <span style={{ color: 'var(--ql-ink-faint)', fontStyle: 'italic', fontWeight: 400 }}>Untitled</span>}
                </div>
              </div>

              {/* Year rows */}
              {[1, 2, 3, 4, 5].map(year => {
                const yearMilestones = (lp?.milestones || []).filter((ms: Milestone) => ms.year === year)
                return (
                  <div key={year} style={{ display: 'flex', gap: 1, marginBottom: 1 }}>
                    <div style={{ width: 72, flexShrink: 0, display: 'flex', alignItems: 'flex-start', paddingTop: 12 }}>
                      <div style={{
                        fontSize: 12,
                        fontFamily: "'Caveat', cursive",
                        color: 'var(--ql-ink-faint)',
                        border: '1px solid var(--ql-rule)',
                        padding: '2px 6px',
                      }}>
                        Year {year}
                      </div>
                    </div>
                    <div style={{
                      flex: 1,
                      minHeight: 60,
                      border: '1px solid var(--ql-rule)',
                      padding: 10,
                      background: 'var(--ql-paper)',
                    }}>
                      <MilestoneList milestones={yearMilestones} color={m.color} />
                    </div>
                  </div>
                )
              })}

              {/* Dashboard gauges */}
              <div style={{ marginTop: 24 }}>
                <h3 style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 12,
                }}>
                  Dashboard
                </h3>
                <div style={{ border: '1px solid var(--ql-rule)', padding: 14, background: 'var(--ql-paper-deep)' }}>
                  {gauges.map(g => (
                    <div key={g.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ql-ink-faint)', marginBottom: 3 }}>
                        <span>{g.label}</span>
                        <span style={{ color: m.color }}>{g.value}</span>
                      </div>
                      <div style={{ height: 1, background: 'var(--ql-rule)', position: 'relative' }}>
                        <div style={{
                          position: 'absolute', left: 0, top: 0, height: 1,
                          width: `${g.value}%`, background: m.color,
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}
