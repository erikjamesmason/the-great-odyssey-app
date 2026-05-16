'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { QL_COLORS, LIFE_NUMERALS, LIFE_SEAL_IDS, type Prototype, type OdysseyPlan, type LifePlanType, type PrototypeType, type PrototypeStatus } from '@/lib/types'
import { Plus, Trash2 } from 'lucide-react'
import { QLSeal, QLOrnament } from '@/components/ui/QLComponents'

interface PrototypeViewProps {
  odysseyPlan: OdysseyPlan
  initialPrototypes: Prototype[]
}

const PROTOTYPE_TYPE_LABELS: Record<PrototypeType, string> = {
  experiment:   'experiment',
  interview:    'conversation',
  course:       'study',
  side_project: 'side project',
}

const STATUS_LABELS: Record<PrototypeStatus, string> = {
  planned:     'planned',
  in_progress: 'underway',
  completed:   'done',
  abandoned:   'let go',
}

const STATUS_COLORS: Record<PrototypeStatus, string> = {
  planned:     'var(--ql-ink-faint)',
  in_progress: 'var(--ql-l1)',
  completed:   'var(--ql-l2)',
  abandoned:   'var(--ql-ink-faint)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--ql-paper)',
  border: '1px solid var(--ql-rule)',
  padding: '8px 10px',
  fontSize: 13,
  color: 'var(--ql-ink)',
  outline: 'none',
  fontFamily: "'Inter', sans-serif",
  boxSizing: 'border-box',
}

export default function PrototypeView({ odysseyPlan, initialPrototypes }: PrototypeViewProps) {
  const [prototypes, setPrototypes] = useState<Prototype[]>(initialPrototypes)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    life_plan_id: odysseyPlan.life_plans?.[0]?.id || '',
    type: 'experiment' as PrototypeType,
    title: '',
    description: '',
    status: 'planned' as PrototypeStatus,
    scheduled_date: '',
    notes: '',
  })

  const lifePlans = odysseyPlan.life_plans || []

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { data, error } = await supabase
      .from('prototypes')
      .insert({ ...form, scheduled_date: form.scheduled_date || null })
      .select()
      .single()
    if (error || !data) return
    setPrototypes([data, ...prototypes])
    setAdding(false)
    setForm({ ...form, title: '', description: '', notes: '', scheduled_date: '' })
  }

  async function handleStatusChange(id: string, status: PrototypeStatus) {
    const supabase = createClient()
    const { error } = await supabase.from('prototypes').update({ status }).eq('id', id)
    if (!error) setPrototypes(prototypes.map(p => p.id === id ? { ...p, status } : p))
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('prototypes').delete().eq('id', id)
    if (!error) setPrototypes(prototypes.filter(p => p.id !== id))
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 640, fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 4 }}>
            Underway
          </div>
          <h2 style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 26,
            fontWeight: 400,
            color: 'var(--ql-ink)',
            margin: 0,
          }}>
            Prototypes
          </h2>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--ql-ink)', border: 'none',
            padding: '8px 14px',
            fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--ql-paper)', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Plus style={{ width: 12, height: 12 }} />
          Add
        </button>
      </div>

      <p style={{ fontSize: 13, color: 'var(--ql-ink-faint)', fontStyle: 'italic', margin: '0 0 24px' }}>
        Small experiments to test a path before committing to it.
      </p>

      <QLOrnament width={160} />

      {/* Add form */}
      {adding && (
        <form onSubmit={handleAdd} style={{
          background: 'var(--ql-paper-deep)',
          border: '1px solid var(--ql-rule)',
          padding: 20,
          margin: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)' }}>
            New prototype
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 6 }}>
                Life
              </label>
              <select value={form.life_plan_id} onChange={e => setForm({ ...form, life_plan_id: e.target.value })} style={inputStyle}>
                {lifePlans.map((lp: { id: string; type: LifePlanType; title: string }) => (
                  <option key={lp.id} value={lp.id}>
                    {LIFE_NUMERALS[lp.type]}: {lp.title || 'Untitled'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 6 }}>
                Type
              </label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as PrototypeType })} style={inputStyle}>
                {(Object.entries(PROTOTYPE_TYPE_LABELS) as [PrototypeType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 6 }}>
              Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Coffee with a bookbinder on Vine St."
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 6 }}>
              Note
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What are you trying to learn from this?"
              rows={2}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 6 }}>
                Status
              </label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as PrototypeStatus })} style={inputStyle}>
                {(Object.entries(STATUS_LABELS) as [PrototypeStatus, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 6 }}>
                Date
              </label>
              <input
                type="date"
                value={form.scheduled_date}
                onChange={e => setForm({ ...form, scheduled_date: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setAdding(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'var(--ql-ink-faint)', padding: '8px 12px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: 'var(--ql-ink)', border: 'none', padding: '8px 16px',
                fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'var(--ql-paper)', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div style={{ marginTop: adding ? 0 : 24 }}>
        {prototypes.length === 0 && !adding ? (
          <div style={{
            padding: '48px 20px',
            border: '1px dashed var(--ql-rule)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: 'var(--ql-ink-faint)', fontStyle: 'italic', margin: 0 }}>
              Nothing underway yet. Add the first experiment.
            </p>
          </div>
        ) : (
          prototypes.map(p => {
            const lp = lifePlans.find((l: { id: string }) => l.id === p.life_plan_id)
            const lifeType = (lp?.type ?? 'expected') as LifePlanType
            const color = QL_COLORS[lifeType]

            return (
              <div key={p.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '14px 0',
                borderBottom: '1px solid var(--ql-rule)',
              }}>
                <QLSeal id={LIFE_SEAL_IDS[lifeType]} size={28} color={color} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: 13, color }}>
                      {LIFE_NUMERALS[lifeType]}
                    </span>
                    <span style={{
                      fontSize: 9,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--ql-ink-faint)',
                    }}>
                      {PROTOTYPE_TYPE_LABELS[p.type]}
                    </span>
                  </div>

                  <div style={{ fontSize: 14, color: 'var(--ql-ink)', marginBottom: 4 }}>{p.title}</div>

                  {p.description && (
                    <div style={{ fontSize: 12, color: 'var(--ql-ink-faint)', fontStyle: 'italic', marginBottom: 6 }}>
                      {p.description}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      value={p.status}
                      onChange={e => handleStatusChange(p.id, e.target.value as PrototypeStatus)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: STATUS_COLORS[p.status],
                        fontFamily: "'Inter', sans-serif",
                        cursor: 'pointer',
                        padding: 0,
                        outline: 'none',
                      }}
                    >
                      {(Object.entries(STATUS_LABELS) as [PrototypeStatus, string][]).map(([val, lbl]) => (
                        <option key={val} value={val}>{lbl}</option>
                      ))}
                    </select>

                    {p.scheduled_date && (
                      <span style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: 'var(--ql-ink-faint)' }}>
                        {new Date(p.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(p.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--ql-ink-faint)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexShrink: 0,
                    padding: '2px 4px',
                  }}
                >
                  <Trash2 style={{ width: 12, height: 12 }} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
