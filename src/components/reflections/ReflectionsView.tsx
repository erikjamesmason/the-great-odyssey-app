'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { QLMarginQuote, QLPageFoot, QLOrnament } from '@/components/ui/QLComponents'
import type { Reflection } from '@/lib/types'

interface ReflectionsViewProps {
  planId: string
  userId: string
  initialReflections: Reflection[]
}

export default function ReflectionsView({ planId, userId, initialReflections }: ReflectionsViewProps) {
  const [reflections, setReflections] = useState<Reflection[]>(initialReflections)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!text.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('plan_reflections')
      .insert({ odyssey_plan_id: planId, user_id: userId, text: text.trim() })
      .select()
      .single()
    setSaving(false)
    if (error || !data) return
    setReflections(prev => [data as Reflection, ...prev])
    setText('')
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 600, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 4 }}>
        Marginalia
      </div>
      <h2 style={{
        fontFamily: "'Caveat', cursive",
        fontSize: 26,
        fontWeight: 400,
        color: 'var(--ql-ink)',
        margin: '0 0 8px',
      }}>
        Notes in the margin
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ql-ink-faint)', fontStyle: 'italic', margin: '0 0 24px' }}>
        Unstructured observations. Things that don&rsquo;t fit anywhere else.
      </p>

      <QLOrnament width={160} />

      {/* new reflection */}
      <div style={{ margin: '24px 0' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="A thought, a question, something you noticed…"
          rows={4}
          style={{
            width: '100%',
            background: 'var(--ql-paper-deep)',
            border: '1px solid var(--ql-rule)',
            padding: '10px 12px',
            fontSize: 13,
            color: 'var(--ql-ink)',
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd()
          }}
        />
        <button
          onClick={handleAdd}
          disabled={saving || !text.trim()}
          style={{
            marginTop: 8,
            padding: '8px 24px',
            background: 'var(--ql-ink)',
            color: 'var(--ql-paper)',
            border: 'none',
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.05em',
            cursor: saving || !text.trim() ? 'not-allowed' : 'pointer',
            opacity: saving || !text.trim() ? 0.5 : 1,
          }}
        >
          {saving ? 'Adding…' : 'Add note'}
        </button>
      </div>

      {/* past reflections */}
      {reflections.length > 0 ? (
        <div>
          {reflections.map(r => (
            <div key={r.id} style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 13,
                color: 'var(--ql-ink-faint)',
                marginBottom: 6,
              }}>
                {new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <QLMarginQuote>{r.text}</QLMarginQuote>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--ql-ink-faint)', fontStyle: 'italic', marginTop: 24 }}>
          Nothing yet. The margin is blank.
        </div>
      )}

      <QLPageFoot folio="Marginalia" />
    </div>
  )
}
