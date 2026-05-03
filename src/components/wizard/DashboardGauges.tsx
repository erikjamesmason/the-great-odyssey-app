'use client'

interface Gauges {
  resources: number
  likeability: number
  confidence: number
  coherence: number
}

interface DashboardGaugesProps {
  gauges: Gauges
  color: string
  onChange: (gauges: Gauges) => void
}

const GAUGE_META = [
  {
    key: 'resources' as keyof Gauges,
    label: 'Resources',
    description: 'Do you have the time, money, skills, and contacts to pull this off?',
    low: 'Very few resources',
    high: 'Fully resourced',
  },
  {
    key: 'likeability' as keyof Gauges,
    label: 'Likeability',
    description: 'How much do you emotionally want this? Does it excite you?',
    low: 'Cold',
    high: 'On fire',
  },
  {
    key: 'confidence' as keyof Gauges,
    label: 'Confidence',
    description: 'How confident are you that you could actually execute this?',
    low: 'Very unsure',
    high: 'Very confident',
  },
  {
    key: 'coherence' as keyof Gauges,
    label: 'Coherence',
    description: 'Does this plan feel consistent with who you are and what you value?',
    low: 'Feels wrong',
    high: 'Deeply aligned',
  },
]

export default function DashboardGauges({ gauges, color, onChange }: DashboardGaugesProps) {
  function handleChange(key: keyof Gauges, value: number) {
    onChange({ ...gauges, [key]: value })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {GAUGE_META.map(({ key, label, description, low, high }) => {
        const value = gauges[key]
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ql-ink)' }}>{label}</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ql-ink-soft)', fontFamily: "'Caveat', cursive" }}>{value}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', margin: '0 0 10px' }}>{description}</p>
            <input
              type="range"
              min={0}
              max={100}
              value={value}
              onChange={e => handleChange(key, Number(e.target.value))}
              style={{ width: '100%', accentColor: color, cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ql-ink-faint)', marginTop: 4 }}>
              <span>{low}</span>
              <span>{high}</span>
            </div>
            {/* hairline gauge bar */}
            <div style={{ marginTop: 8, height: 1, background: 'var(--ql-rule)', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: 1,
                width: `${value}%`,
                background: color,
                transition: 'width 0.15s',
              }} />
            </div>
          </div>
        )
      })}

      {gauges.likeability > 75 && gauges.resources < 30 && (
        <div style={{
          background: 'var(--ql-paper-deep)',
          border: '1px solid var(--ql-rule)',
          borderLeft: '3px solid var(--ql-l3)',
          padding: '12px 16px',
          fontSize: 13,
          color: 'var(--ql-ink-soft)',
        }}>
          <strong>Heads up:</strong> You love this path but feel low on resources. Talk to your AI guide about concrete ways to close that gap.
        </div>
      )}
    </div>
  )
}
