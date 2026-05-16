'use client'

import type { DashboardGauges } from '@/lib/types'
import { QLTicks } from '@/components/ui/QLComponents'

interface DashboardGaugesProps {
  gauges: DashboardGauges
  color: string
  onChange: (gauges: DashboardGauges) => void
}

const GAUGE_META = [
  {
    key: 'resources' as keyof DashboardGauges,
    label: 'Resources',
    description: 'Time, money, skills, contacts — do you have them?',
  },
  {
    key: 'likeability' as keyof DashboardGauges,
    label: 'Likeability',
    description: 'How much do you emotionally want this?',
  },
  {
    key: 'confidence' as keyof DashboardGauges,
    label: 'Confidence',
    description: 'How sure are you that you could actually pull it off?',
  },
  {
    key: 'coherence' as keyof DashboardGauges,
    label: 'Coherence',
    description: 'Does this feel like you?',
  },
]

export default function DashboardGauges({ gauges, color, onChange }: DashboardGaugesProps) {
  function handleChange(key: keyof DashboardGauges, value: number) {
    onChange({ ...gauges, [key]: value })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {GAUGE_META.map(({ key, label, description }) => {
        const value = gauges[key]
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ql-ink-faint)',
                fontFamily: "'Inter', sans-serif",
              }}>
                {label}
              </span>
              <span style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 16,
                color: 'var(--ql-ink-soft)',
              }}>
                {value}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', fontStyle: 'italic', margin: '0 0 8px' }}>
              {description}
            </p>
            {/* QLTicks visual with hidden range overlay */}
            <div style={{ position: 'relative', height: 20 }}>
              <QLTicks value={value} color={color} />
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={value}
                onChange={e => handleChange(key, Number(e.target.value))}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  margin: 0,
                }}
              />
            </div>
          </div>
        )
      })}

      {gauges.likeability > 75 && gauges.resources < 30 && (
        <div style={{
          background: 'var(--ql-paper-deep)',
          border: '1px solid var(--ql-rule)',
          borderLeft: '2px solid var(--ql-l3)',
          padding: '12px 14px',
          fontSize: 12,
          fontStyle: 'italic',
          color: 'var(--ql-ink-soft)',
          fontFamily: "'Inter', sans-serif",
        }}>
          You love this path but feel low on resources. Talk to the guide about closing that gap.
        </div>
      )}
    </div>
  )
}
