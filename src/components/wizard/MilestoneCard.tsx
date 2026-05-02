'use client'

import { useState } from 'react'
import { MILESTONE_CATEGORY_LABELS, type MilestoneCategory } from '@/lib/types'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface MilestoneCardProps {
  milestone: { title: string; description: string; category: MilestoneCategory }
  color?: string
  onUpdate: (field: string, value: string) => void
  onRemove: () => void
}

export default function MilestoneCard({ milestone, color, onUpdate, onRemove }: MilestoneCardProps) {
  const [expanded, setExpanded] = useState(!milestone.title)

  return (
    <div className="bg-stone-800/60 border border-stone-700 rounded-xl p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={milestone.title}
          onChange={e => onUpdate('title', e.target.value)}
          placeholder="Milestone title"
          className="flex-1 bg-transparent text-sm outline-none placeholder-stone-600"
        />
        <select
          value={milestone.category}
          onChange={e => onUpdate('category', e.target.value)}
          className="bg-stone-700 text-xs rounded-lg px-2 py-1 outline-none border border-stone-600"
        >
          {(Object.entries(MILESTONE_CATEGORY_LABELS) as [MilestoneCategory, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button onClick={() => setExpanded(!expanded)} className="text-stone-500 hover:text-stone-300">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button onClick={onRemove} className="text-stone-600 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {expanded && (
        <textarea
          value={milestone.description}
          onChange={e => onUpdate('description', e.target.value)}
          placeholder="Optional notes about this milestone..."
          rows={2}
          className="mt-2 w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none resize-none focus:border-stone-500 transition-colors placeholder-stone-600"
        />
      )}
    </div>
  )
}
