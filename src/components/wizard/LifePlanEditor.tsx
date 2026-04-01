'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LIFE_PLAN_LABELS, MILESTONE_CATEGORY_LABELS, type LifePlanType, type MilestoneCategory } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import DashboardGauges from './DashboardGauges'
import MilestoneCard from './MilestoneCard'

interface LifePlanEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lifePlan: any
  type: LifePlanType
}

const STEPS = ['title', 'questions', 'milestones', 'gauges'] as const
type Step = typeof STEPS[number]

const stepLabels: Record<Step, string> = {
  title: '1. Give it a title',
  questions: '2. Questions this life answers',
  milestones: '3. Five-year timeline',
  gauges: '4. Dashboard',
}

export default function LifePlanEditor({ lifePlan, type }: LifePlanEditorProps) {
  const meta = LIFE_PLAN_LABELS[type]
  const [step, setStep] = useState<Step>('title')
  const [title, setTitle] = useState(lifePlan.title || '')
  const [questions, setQuestions] = useState<string[]>(
    lifePlan.questions?.length ? lifePlan.questions : ['', '']
  )
  const [milestones, setMilestones] = useState<{
    id?: string; year: number; title: string; description: string; category: MilestoneCategory
  }[]>(lifePlan.milestones || [])
  const [gauges, setGauges] = useState({
    resources: lifePlan.gauge_resources ?? 50,
    likeability: lifePlan.gauge_likeability ?? 50,
    confidence: lifePlan.gauge_confidence ?? 50,
    coherence: lifePlan.gauge_coherence ?? 50,
  })
  const [saving, setSaving] = useState(false)

  const colorMap: Record<LifePlanType, string> = {
    expected: 'indigo',
    alternative: 'emerald',
    wildcard: 'amber',
  }
  const color = colorMap[type]

  const save = useCallback(async () => {
    setSaving(true)
    const supabase = createClient()

    await supabase.from('life_plans').update({
      title,
      questions: questions.filter(q => q.trim()),
      gauge_resources: gauges.resources,
      gauge_likeability: gauges.likeability,
      gauge_confidence: gauges.confidence,
      gauge_coherence: gauges.coherence,
    }).eq('id', lifePlan.id)

    // Upsert milestones
    const existingIds = milestones.filter(m => m.id).map(m => m.id!)
    const toDelete = (lifePlan.milestones || [])
      .filter((m: { id: string }) => !existingIds.includes(m.id))
      .map((m: { id: string }) => m.id)

    if (toDelete.length) {
      await supabase.from('milestones').delete().in('id', toDelete)
    }

    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i]
      if (m.id) {
        await supabase.from('milestones').update({
          year: m.year, title: m.title, description: m.description, category: m.category, position: i,
        }).eq('id', m.id)
      } else if (m.title.trim()) {
        await supabase.from('milestones').insert({
          life_plan_id: lifePlan.id, year: m.year, title: m.title,
          description: m.description, category: m.category, position: i,
        })
      }
    }

    setSaving(false)
  }, [lifePlan.id, lifePlan.milestones, title, questions, gauges, milestones])

  function addQuestion() {
    if (questions.length < 3) setQuestions([...questions, ''])
  }

  function updateQuestion(i: number, val: string) {
    const updated = [...questions]
    updated[i] = val
    setQuestions(updated)
  }

  function removeQuestion(i: number) {
    setQuestions(questions.filter((_, idx) => idx !== i))
  }

  function addMilestone(year: number) {
    setMilestones([...milestones, { year, title: '', description: '', category: 'career' }])
  }

  function updateMilestone(idx: number, field: string, val: string | number) {
    const updated = [...milestones]
    updated[idx] = { ...updated[idx], [field]: val }
    setMilestones(updated)
  }

  function removeMilestone(idx: number) {
    setMilestones(milestones.filter((_, i) => i !== idx))
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step navigation */}
      <div className="flex gap-1 mb-8">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={cn(
              'flex-1 py-2 text-xs rounded-lg transition-colors font-medium',
              step === s
                ? `bg-${color}-600/20 text-${color}-300 border border-${color}-700`
                : i < stepIndex
                ? 'bg-stone-800 text-stone-300'
                : 'bg-stone-800/50 text-stone-600'
            )}
          >
            {stepLabels[s]}
          </button>
        ))}
      </div>

      {/* Step: Title */}
      {step === 'title' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">{meta.label}: Give it a name</h2>
            <p className="text-stone-400 text-sm">A short, evocative title — 3 to 6 words. What is the headline of this life?</p>
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`e.g. "Running My Own Firm" or "Living in the Wild"`}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-lg outline-none focus:border-indigo-500 transition-colors"
          />
          <p className="text-xs text-stone-500">
            <span className={`text-${color}-400 font-semibold`}>{meta.label}</span> — {meta.description}
          </p>
        </div>
      )}

      {/* Step: Questions */}
      {step === 'questions' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Questions this life answers</h2>
            <p className="text-stone-400 text-sm">
              What curiosities or uncertainties would living this life resolve? (2–3 questions)
            </p>
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={q}
                  onChange={e => updateQuestion(i, e.target.value)}
                  placeholder={`e.g. "Can I really make a living doing what I love?"`}
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors"
                />
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(i)} className="text-stone-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {questions.length < 3 && (
            <button onClick={addQuestion} className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-200 transition-colors">
              <Plus className="w-4 h-4" />
              Add another question
            </button>
          )}
        </div>
      )}

      {/* Step: Milestones */}
      {step === 'milestones' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Five-year timeline</h2>
            <p className="text-stone-400 text-sm">
              Map out key milestones across each year. Think: career moves, experiences, skills, relationships, geography.
            </p>
          </div>
          {[1, 2, 3, 4, 5].map(year => {
            const yearMilestones = milestones
              .map((m, idx) => ({ ...m, idx }))
              .filter(m => m.year === year)
            return (
              <div key={year}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`text-xs font-bold text-${color}-400 bg-${color}-950 border border-${color}-800 rounded-full px-3 py-1`}>
                    Year {year}
                  </div>
                  <div className="flex-1 border-t border-stone-800" />
                  <button
                    onClick={() => addMilestone(year)}
                    className="text-xs text-stone-500 hover:text-stone-300 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
                {yearMilestones.length === 0 && (
                  <p className="text-stone-600 text-xs ml-2 mb-2">No milestones yet — click Add to start.</p>
                )}
                <div className="space-y-2 pl-2">
                  {yearMilestones.map(m => (
                    <MilestoneCard
                      key={m.idx}
                      milestone={m}
                      color={color}
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
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Dashboard</h2>
            <p className="text-stone-400 text-sm">
              Rate this life plan honestly across four dimensions.
            </p>
          </div>
          <DashboardGauges gauges={gauges} color={color} onChange={setGauges} />
        </div>
      )}

      {/* Footer: Save + navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-800">
        <button
          onClick={() => setStep(STEPS[Math.max(0, stepIndex - 1)])}
          disabled={stepIndex === 0}
          className="text-sm text-stone-400 hover:text-stone-200 disabled:opacity-30 transition-colors"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="bg-stone-800 hover:bg-stone-700 disabled:opacity-50 rounded-xl px-4 py-2 text-sm transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {stepIndex < STEPS.length - 1 && (
            <button
              onClick={() => setStep(STEPS[stepIndex + 1])}
              className={`bg-${color}-600 hover:bg-${color}-500 rounded-xl px-4 py-2 text-sm font-medium transition-colors`}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
