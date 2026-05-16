'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HAND_LABELS, LIFE_NUMERALS, LIFE_SEAL_IDS, QL_COLORS, type LifePlan, type LifePlanType, type MilestoneCategory } from '@/lib/types'
import { Plus, Trash2 } from 'lucide-react'
import DashboardGauges from './DashboardGauges'
import MilestoneCard from './MilestoneCard'
import { QLSeal, QLOrnament, QLMarginQuote } from '@/components/ui/QLComponents'

interface LifePlanEditorProps {
  lifePlan: LifePlan
  type: LifePlanType
}

export default function LifePlanEditor({ lifePlan, type }: LifePlanEditorProps) {
  const qlColor = QL_COLORS[type]

  const [title, setTitle] = useState(lifePlan.title || '')
  const initialQuestions = (lifePlan.questions?.length ? lifePlan.questions : ['', '']) as string[]
  const [questions, setQuestions] = useState<{ key: number; text: string }[]>(
    initialQuestions.map((t, i) => ({ key: i, text: t }))
  )
  const questionKeyRef = useRef(initialQuestions.length)
  const [milestones, setMilestones] = useState<{
    id?: string; _clientKey?: number; year: number; title: string; description: string; category: MilestoneCategory
  }[]>(lifePlan.milestones || [])
  const [gauges, setGauges] = useState({
    resources: lifePlan.gauge_resources ?? 50,
    likeability: lifePlan.gauge_likeability ?? 50,
    confidence: lifePlan.gauge_confidence ?? 50,
    coherence: lifePlan.gauge_coherence ?? 50,
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const clientKeyRef = useRef(0)

  const save = useCallback(async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('not authenticated — session missing in browser client')

      const { error: lpError } = await supabase.from('life_plans').update({
        title,
        questions: questions.map(q => q.text).filter(t => t.trim()),
        gauge_resources: gauges.resources,
        gauge_likeability: gauges.likeability,
        gauge_confidence: gauges.confidence,
        gauge_coherence: gauges.coherence,
      }).eq('id', lifePlan.id)
      if (lpError) throw new Error(`life_plans update: ${lpError.message}`)

      if (deletedIds.length) {
        const { error: delError } = await supabase.from('milestones').delete().in('id', deletedIds)
        if (delError) throw new Error(`milestones delete: ${delError.message}`)
      }

      const updatedMilestones = [...milestones]
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i]
        if (m.id) {
          const { error: updateError } = await supabase.from('milestones').update({
            year: m.year, title: m.title, description: m.description, category: m.category, position: i,
          }).eq('id', m.id)
          if (updateError) throw new Error(`milestone update: ${updateError.message}`)
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('milestones')
            .insert({
              life_plan_id: lifePlan.id, year: m.year, title: m.title,
              description: m.description, category: m.category, position: i,
            })
            .select('id')
            .single()
          if (insertError) throw new Error(`milestone insert: ${insertError.message}`)
          if (inserted) updatedMilestones[i] = { ...m, id: inserted.id }
        }
      }

      setMilestones(updatedMilestones)
      setDeletedIds([])
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      setSaveError(msg)
      throw err
    } finally {
      setSaving(false)
    }
  }, [lifePlan.id, title, questions, gauges, milestones, deletedIds])

  function addQuestion() {
    if (questions.length < 3) {
      const key = questionKeyRef.current++
      setQuestions([...questions, { key, text: '' }])
    }
  }

  function updateQuestion(key: number, val: string) {
    setQuestions(questions.map(q => q.key === key ? { ...q, text: val } : q))
  }

  function removeQuestion(key: number) {
    if (questions.length <= 1) return
    setQuestions(questions.filter(q => q.key !== key))
  }

  function addMilestone(year: number) {
    setMilestones([...milestones, { _clientKey: ++clientKeyRef.current, year, title: '', description: '', category: 'career' }])
  }

  function updateMilestone(idx: number, field: string, val: string | number) {
    const updated = [...milestones]
    updated[idx] = { ...updated[idx], [field]: val }
    setMilestones(updated)
  }

  function removeMilestone(idx: number) {
    const m = milestones[idx]
    if (m.id) setDeletedIds(prev => [...prev, m.id!])
    setMilestones(milestones.filter((_, i) => i !== idx))
  }

  const ROMAN_YEARS = ['I', 'II', 'III', 'IV', 'V']

  return (
    <div style={{
      maxWidth: 600,
      margin: '0 auto',
      padding: '32px 24px 64px',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* QL header: seal + numeral + hand label */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 28 }}>
        <QLSeal id={LIFE_SEAL_IDS[type]} size={56} color={qlColor} />
        <div>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 32,
            color: qlColor,
            lineHeight: 1,
          }}>
            {LIFE_NUMERALS[type]}
          </div>
          <div style={{
            fontSize: 12,
            fontStyle: 'italic',
            color: 'var(--ql-ink-faint)',
            marginTop: 4,
          }}>
            {HAND_LABELS[type]}
          </div>
        </div>
      </div>

      {/* title input — borderless, large */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Name this life"
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          borderBottom: '1px solid var(--ql-rule)',
          padding: '6px 0',
          fontSize: 20,
          color: 'var(--ql-ink)',
          fontFamily: "'Inter', sans-serif",
          outline: 'none',
          marginBottom: 32,
          boxSizing: 'border-box',
        }}
      />

      {/* error banner */}
      {saveError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          padding: '10px 14px',
          marginBottom: 20,
          fontSize: 12,
          color: '#b91c1c',
        }}>
          {saveError}
        </div>
      )}

      {/* Questions */}
      <section style={{ marginBottom: 40 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ql-ink-faint)',
          marginBottom: 12,
        }}>
          Questions
        </div>

        {questions.map(q => (
          <QLMarginQuote key={q.key}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <textarea
                value={q.text}
                onChange={e => updateQuestion(q.key, e.target.value)}
                placeholder="What would living this life answer for you?"
                rows={2}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  resize: 'vertical',
                  fontSize: 13,
                  fontStyle: 'italic',
                  color: 'var(--ql-ink-soft)',
                  fontFamily: "'Inter', sans-serif",
                  padding: 0,
                  lineHeight: 1.5,
                }}
              />
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(q.key)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ql-ink-faint)', display: 'flex', flexShrink: 0, marginTop: 2 }}
                >
                  <Trash2 style={{ width: 12, height: 12 }} />
                </button>
              )}
            </div>
          </QLMarginQuote>
        ))}

        {questions.length < 3 && (
          <button
            onClick={addQuestion}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: 'var(--ql-ink-faint)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              marginTop: 4,
            }}
          >
            <Plus style={{ width: 11, height: 11 }} />
            Add question
          </button>
        )}
      </section>

      <QLOrnament />

      {/* Milestones */}
      <section style={{ marginTop: 32, marginBottom: 40 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ql-ink-faint)',
          marginBottom: 20,
        }}>
          Five-year timeline
        </div>

        {[1, 2, 3, 4, 5].map(year => {
          const yearMilestones = milestones
            .map((m, idx) => ({ ...m, idx }))
            .filter(m => m.year === year)
          return (
            <div key={year} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 20,
                  color: qlColor,
                  minWidth: 20,
                }}>
                  {ROMAN_YEARS[year - 1]}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--ql-rule)' }} />
                <button
                  onClick={() => addMilestone(year)}
                  style={{
                    fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: 'var(--ql-ink-faint)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <Plus style={{ width: 11, height: 11 }} />
                  Add
                </button>
              </div>

              {yearMilestones.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', fontStyle: 'italic', marginLeft: 28, marginBottom: 0 }}>
                  Nothing yet.
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 28 }}>
                {yearMilestones.map(m => (
                  <MilestoneCard
                    key={m.id ?? `new-${m._clientKey}`}
                    milestone={m}
                    onUpdate={(field, val) => updateMilestone(m.idx, field, val)}
                    onRemove={() => removeMilestone(m.idx)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <QLOrnament />

      {/* Gauges */}
      <section style={{ marginTop: 32, marginBottom: 40 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ql-ink-faint)',
          marginBottom: 4,
        }}>
          Dashboard
        </div>
        <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', fontStyle: 'italic', marginBottom: 20 }}>
          Rate this life honestly across four dimensions.
        </p>
        <DashboardGauges gauges={gauges} color={qlColor} onChange={setGauges} />
      </section>

      {/* Save */}
      <div style={{ borderTop: '1px solid var(--ql-rule)', paddingTop: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={async () => { try { await save() } catch { /* error shown inline */ } }}
          disabled={saving}
          style={{
            padding: '10px 28px',
            background: 'var(--ql-ink)',
            color: 'var(--ql-paper)',
            border: 'none',
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.05em',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {savedAt && !saving && (
          <span style={{ fontSize: 11, color: 'var(--ql-ink-faint)', fontFamily: "'Caveat', cursive" }}>
            saved {savedAt}
          </span>
        )}
      </div>
    </div>
  )
}
