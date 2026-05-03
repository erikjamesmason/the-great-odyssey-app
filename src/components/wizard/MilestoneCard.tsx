'use client'

import { useState } from 'react'
import { MILESTONE_CATEGORY_LABELS, type MilestoneCategory } from '@/lib/types'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'

type MilestoneField = 'title' | 'description' | 'category'

interface MilestoneCardProps {
  milestone: { title: string; description: string; category: MilestoneCategory }
  onUpdate: (field: MilestoneField, value: string) => void
  onRemove: () => void
}

export default function MilestoneCard({ milestone, onUpdate, onRemove }: MilestoneCardProps) {
  const [expanded, setExpanded] = useState(milestone.title === '')

  return (
    <div style={{
      background: 'var(--ql-paper-deep)',
      border: '1px solid var(--ql-rule)',
      padding: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="text"
          value={milestone.title}
          onChange={e => onUpdate('title', e.target.value)}
          placeholder="Milestone title"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            fontSize: 13,
            color: 'var(--ql-ink)',
            outline: 'none',
            fontFamily: "'Inter', sans-serif",
          }}
        />
        <select
          value={milestone.category}
          onChange={e => onUpdate('category', e.target.value)}
          style={{
            background: 'var(--ql-paper)',
            border: '1px solid var(--ql-rule)',
            fontSize: 11,
            padding: '2px 6px',
            color: 'var(--ql-ink-soft)',
            outline: 'none',
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
          }}
        >
          {(Object.entries(MILESTONE_CATEGORY_LABELS) as [MilestoneCategory, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ql-ink-faint)', display: 'flex' }}
        >
          {expanded
            ? <ChevronUp style={{ width: 14, height: 14 }} />
            : <ChevronDown style={{ width: 14, height: 14 }} />}
        </button>
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ql-ink-faint)', display: 'flex' }}
        >
          <Trash2 style={{ width: 13, height: 13 }} />
        </button>
      </div>
      {expanded && (
        <textarea
          value={milestone.description}
          onChange={e => onUpdate('description', e.target.value)}
          placeholder="Optional notes about this milestone…"
          rows={2}
          style={{
            marginTop: 8,
            width: '100%',
            background: 'var(--ql-paper)',
            border: '1px solid var(--ql-rule)',
            padding: '8px 10px',
            fontSize: 12,
            color: 'var(--ql-ink-soft)',
            outline: 'none',
            resize: 'none',
            fontFamily: "'Inter', sans-serif",
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  )
}
