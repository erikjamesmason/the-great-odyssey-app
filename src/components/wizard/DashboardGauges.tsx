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
    <div className="space-y-8">
      {GAUGE_META.map(({ key, label, description, low, high }) => {
        const value = gauges[key]
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{label}</span>
              <span className="text-lg font-bold text-stone-300">{value}</span>
            </div>
            <p className="text-xs text-stone-500 mb-3">{description}</p>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={e => handleChange(key, Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-stone-600 mt-1">
                <span>{low}</span>
                <span>{high}</span>
              </div>
            </div>
            {/* Visual bar */}
            <div className="mt-2 h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        )
      })}

      {/* Conflict hint */}
      {gauges.likeability > 75 && gauges.resources < 30 && (
        <div className="bg-amber-950/50 border border-amber-800 rounded-xl p-4 text-sm text-amber-300">
          <strong>Heads up:</strong> You love this path but feel low on resources. Talk to your AI guide about concrete ways to close that gap.
        </div>
      )}
    </div>
  )
}
