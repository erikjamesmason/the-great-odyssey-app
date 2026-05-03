'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LIFE_PLAN_LABELS, type LifePlan, type LifePlanType, type MilestoneCategory } from '@/lib/types'
import { Plus, Trash2 } from 'lucide-react'
import DashboardGauges from './DashboardGauges'
import MilestoneCard from './MilestoneCard'

interface LifePlanEditorProps {
  lifePlan: LifePlan
  type: LifePlanType
}

const STEPS = ['title', 'questions', 'milestones', 'gauges'] as const
type Step = typeof STEPS[number]

const stepLabels: Record<Step, string> = {
  title: '1. Title',
  questions: '2. Questions',
  milestones: '3. Timeline',
  gauges: '4. Dashboard',
}

const QL_COLORS: Record<LifePlanType, string> = {
  expected: 'var(--ql-l1)',
  alternative: 'var(--ql-l2)',
  wildcard: 'var(--ql-l3)',
}

export default function LifePlanEditor({ lifePlan, type }: LifePlanEditorProps) {
  const meta = LIFE_PLAN_LABELS[type]
  const qlColor = QL_COLORS[type]

  const [step, setStep] = useState<Step>('title')
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
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const clientKeyRef = useRef(0)

  const save = useCallback(async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const supabase = createClient()

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
        } else if (m.title.trim()) {
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

  const stepIndex = STEPS.indexOf(step)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Step navigation */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={async () => {
              if (s !== step) await save().catch(() => {})
              setStep(s)
            }}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: 11,
              background: 'none',
              border: 'none',
              borderBottom: step === s ? `2px solid ${qlColor}` : '2px solid var(--ql-rule)',
              color: step === s ? 'var(--ql-ink)' : i < stepIndex ? 'var(--ql-ink-soft)' : 'var(--ql-ink-faint)',
              cursor: 'pointer',
              fontWeight: step === s ? 500 : 400,
              fontFamily: "'Inter', sans-serif",
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {stepLabels[s]}
          </button>
        ))}
      </div>

      {/* Step: Title */}
      {step === 'title' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--ql-ink)', margin: '0 0 6px' }}>
              {meta.label}: Give it a name
            </h2>
            <p style={{ fontSize: 13, color: 'var(--ql-ink-faint)', margin: 0 }}>
              A short, evocative title — 3 to 6 words. What is the headline of this life?
            </p>
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`e.g. "Running My Own Firm" or "Living in the Wild"`}
            className="ql-input"
            style={{ fontSize: 18 }}
          />
          <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', margin: 0 }}>
            <span style={{ color: qlColor, fontWeight: 600 }}>{meta.label}</span> — {meta.description}
          </p>
        </div>
      )}

      {/* Step: Questions */}
      {step === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--ql-ink)', margin: '0 0 6px' }}>
              Questions this life answers
            </h2>
            <p style={{ fontSize: 13, color: 'var(--ql-ink-faint)', margin: 0 }}>
              What curiosities or uncertainties would living this life resolve? (2–3 questions)
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {questions.map(q => (
              <div key={q.key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={q.text}
                  onChange={e => updateQuestion(q.key, e.target.value)}
                  placeholder={`e.g. "Can I really make a living doing what I love?"`}
                  className="ql-input"
                />
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(q.key)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ql-ink-faint)', display: 'flex', flexShrink: 0 }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {questions.length < 3 && (
            <button
              onClick={addQuestion}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: 'var(--ql-ink-soft)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Plus style={{ width: 13, height: 13 }} />
              Add another question
            </button>
          )}
        </div>
      )}

      {/* Step: Milestones */}
      {step === 'milestones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--ql-ink)', margin: '0 0 6px' }}>
              Five-year timeline
            </h2>
            <p style={{ fontSize: 13, color: 'var(--ql-ink-faint)', margin: 0 }}>
              Map out key milestones across each year. Think: career moves, experiences, skills, relationships, geography.
            </p>
          </div>
          {[1, 2, 3, 4, 5].map(year => {
            const yearMilestones = milestones
              .map((m, idx) => ({ ...m, idx }))
              .filter(m => m.year === year)
            return (
              <div key={year}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    fontSize: 12,
                    fontFamily: "'Caveat', cursive",
                    color: qlColor,
                    border: `1px solid ${qlColor}`,
                    padding: '2px 10px',
                  }}>
                    Year {year}
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'var(--ql-rule)' }} />
                  <button
                    onClick={() => addMilestone(year)}
                    style={{
                      fontSize: 11, color: 'var(--ql-ink-faint)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <Plus style={{ width: 12, height: 12 }} />
                    Add
                  </button>
                </div>
                {yearMilestones.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', fontStyle: 'italic', marginLeft: 8, marginBottom: 8 }}>
                    No milestones yet — click Add to start.
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 8 }}>
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
        </div>
      )}

      {/* Step: Gauges */}
      {step === 'gauges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--ql-ink)', margin: '0 0 6px' }}>
              Dashboard
            </h2>
            <p style={{ fontSize: 13, color: 'var(--ql-ink-faint)', margin: 0 }}>
              Rate this life plan honestly across four dimensions.
            </p>
          </div>
          <DashboardGauges gauges={gauges} color={qlColor} onChange={setGauges} />
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 32,
        paddingTop: 24,
        borderTop: '1px solid var(--ql-rule)',
      }}>
        <button
          onClick={async () => {
            await save().catch(() => {})
            setStep(STEPS[Math.max(0, stepIndex - 1)])
          }}
          disabled={stepIndex === 0}
          style={{
            background: 'none', border: 'none',
            cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: 12,
            color: stepIndex === 0 ? 'var(--ql-ink-faint)' : 'var(--ql-ink-soft)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Back
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {saveError && (
            <p style={{ fontSize: 11, color: '#b91c1c', margin: 0, maxWidth: 260, textAlign: 'right' }}>
              {saveError}
            </p>
          )}
          {stepIndex < STEPS.length - 1 ? (
            <button
              onClick={async () => {
                try { await save(); setStep(STEPS[stepIndex + 1]) } catch { /* error shown inline */ }
              }}
              disabled={saving}
              style={{
                background: qlColor,
                border: 'none',
                padding: '8px 16px',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {saving ? 'Saving…' : 'Save & Continue'}
            </button>
          ) : (
            <button
              onClick={async () => { try { await save() } catch { /* error shown inline */ } }}
              disabled={saving}
              style={{
                background: 'var(--ql-ink)',
                border: 'none',
                padding: '8px 16px',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--ql-paper)',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
