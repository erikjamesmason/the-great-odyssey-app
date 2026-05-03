'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LIFE_PLAN_LABELS, type Prototype, type OdysseyPlan, type LifePlanType, type PrototypeType, type PrototypeStatus } from '@/lib/types'
import { Plus, Trash2, FlaskConical, Users, BookOpen, Rocket } from 'lucide-react'

interface PrototypeViewProps {
  odysseyPlan: OdysseyPlan
  initialPrototypes: Prototype[]
}

const TYPE_META: Record<PrototypeType, { label: string; icon: React.ReactNode; description: string }> = {
  experiment:   { label: 'Experiment',              icon: <FlaskConical style={{ width: 12, height: 12 }} />, description: 'Try something small in this direction' },
  interview:    { label: 'Informational Interview', icon: <Users        style={{ width: 12, height: 12 }} />, description: 'Talk to someone living this life' },
  course:       { label: 'Course / Learning',       icon: <BookOpen     style={{ width: 12, height: 12 }} />, description: 'Build a skill or explore the field' },
  side_project: { label: 'Side Project',            icon: <Rocket       style={{ width: 12, height: 12 }} />, description: 'Test the idea with a small project' },
}

const STATUS_LABELS: Record<PrototypeStatus, string> = {
  planned:     'Planned',
  in_progress: 'In Progress',
  completed:   'Completed',
  abandoned:   'Abandoned',
}

const LIFE_COLORS: Record<LifePlanType, string> = {
  expected:    'var(--ql-l1)',
  alternative: 'var(--ql-l2)',
  wildcard:    'var(--ql-l3)',
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
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 400, color: 'var(--ql-ink)', margin: '0 0 4px' }}>Prototyping</h2>
          <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', margin: 0 }}>
            Test your life paths with small, low-risk experiments before committing.
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1px solid var(--ql-ink)',
            padding: '8px 14px',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--ql-ink)', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Plus style={{ width: 13, height: 13 }} />
          Add prototype
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleAdd} style={{
          background: 'var(--ql-paper-deep)',
          border: '1px solid var(--ql-rule)',
          padding: 24,
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, margin: 0, color: 'var(--ql-ink)' }}>New prototype</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 6 }}>
                Life path
              </label>
              <select value={form.life_plan_id} onChange={e => setForm({ ...form, life_plan_id: e.target.value })} style={inputStyle}>
                {lifePlans.map((lp: { id: string; type: LifePlanType; title: string }) => (
                  <option key={lp.id} value={lp.id}>
                    {LIFE_PLAN_LABELS[lp.type].label}: {lp.title || 'Untitled'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 6 }}>
                Type
              </label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as PrototypeType })} style={inputStyle}>
                {(Object.entries(TYPE_META) as [PrototypeType, typeof TYPE_META[PrototypeType]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
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
              placeholder="e.g. Coffee chat with a product designer"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 6 }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What will you do? What are you trying to learn?"
              rows={2}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 6 }}>
                Status
              </label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as PrototypeStatus })} style={inputStyle}>
                {(Object.keys(STATUS_LABELS) as PrototypeStatus[]).map(k => (
                  <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', marginBottom: 6 }}>
                Scheduled date
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
                fontSize: 12, color: 'var(--ql-ink-faint)', padding: '8px 16px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: 'var(--ql-ink)', border: 'none', padding: '8px 16px',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--ql-paper)', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Add prototype
            </button>
          </div>
        </form>
      )}

      {/* Prototype list */}
      {prototypes.length === 0 && !adding ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 20px',
          border: '1px dashed var(--ql-rule)',
        }}>
          <FlaskConical style={{ width: 24, height: 24, color: 'var(--ql-ink-faint)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: 'var(--ql-ink-soft)', margin: '0 0 6px' }}>No prototypes yet</p>
          <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', maxWidth: 280, margin: '0 auto' }}>
            Add small experiments, interviews, or side projects to test each life path before committing.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {prototypes.map(p => {
            const lp = lifePlans.find((l: { id: string }) => l.id === p.life_plan_id)
            const typeMeta = TYPE_META[p.type]
            const planColor = lp ? LIFE_COLORS[lp.type as LifePlanType] : 'var(--ql-ink-faint)'
            return (
              <div key={p.id} style={{
                background: 'var(--ql-paper-deep)',
                border: '1px solid var(--ql-rule)',
                padding: 18,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      {lp && (
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          color: planColor, border: `1px solid ${planColor}`,
                          padding: '1px 8px', letterSpacing: '0.05em',
                        }}>
                          {LIFE_PLAN_LABELS[lp.type as LifePlanType].label}
                        </span>
                      )}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, color: 'var(--ql-ink-faint)',
                        border: '1px solid var(--ql-rule)', padding: '1px 8px',
                      }}>
                        {typeMeta.icon}
                        {typeMeta.label}
                      </span>
                      <select
                        value={p.status}
                        onChange={e => handleStatusChange(p.id, e.target.value as PrototypeStatus)}
                        style={{
                          fontSize: 11,
                          background: 'none',
                          border: '1px solid var(--ql-rule)',
                          padding: '1px 6px',
                          color: 'var(--ql-ink-soft)',
                          outline: 'none',
                          cursor: 'pointer',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {(Object.keys(STATUS_LABELS) as PrototypeStatus[]).map(k => (
                          <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                        ))}
                      </select>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--ql-ink)', margin: '0 0 4px' }}>{p.title}</h3>
                    {p.description && (
                      <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', margin: '0 0 4px', lineHeight: 1.5 }}>{p.description}</p>
                    )}
                    {p.scheduled_date && (
                      <p style={{ fontSize: 11, color: 'var(--ql-ink-faint)', margin: 0 }}>
                        Scheduled: {new Date(p.scheduled_date + 'T00:00:00').toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ql-ink-faint)', display: 'flex', flexShrink: 0 }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
