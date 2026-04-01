'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LIFE_PLAN_LABELS, type LifePlanType, type PrototypeType, type PrototypeStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Plus, Trash2, ChevronDown, FlaskConical, Users, BookOpen, Rocket } from 'lucide-react'

interface Prototype {
  id: string
  life_plan_id: string
  type: PrototypeType
  title: string
  description: string
  status: PrototypeStatus
  scheduled_date: string | null
  notes: string
  created_at: string
}

interface PrototypeViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  odysseyPlan: any
  initialPrototypes: Prototype[]
}

const TYPE_META: Record<PrototypeType, { label: string; icon: React.ReactNode; description: string }> = {
  experiment: { label: 'Experiment', icon: <FlaskConical className="w-4 h-4" />, description: 'Try something small in this direction' },
  interview: { label: 'Informational Interview', icon: <Users className="w-4 h-4" />, description: 'Talk to someone living this life' },
  course: { label: 'Course / Learning', icon: <BookOpen className="w-4 h-4" />, description: 'Build a skill or explore the field' },
  side_project: { label: 'Side Project', icon: <Rocket className="w-4 h-4" />, description: 'Test the idea with a small project' },
}

const STATUS_META: Record<PrototypeStatus, { label: string; color: string }> = {
  planned: { label: 'Planned', color: 'text-stone-400 bg-stone-800 border-stone-700' },
  in_progress: { label: 'In Progress', color: 'text-blue-300 bg-blue-950/50 border-blue-800' },
  completed: { label: 'Completed', color: 'text-green-300 bg-green-950/50 border-green-800' },
  abandoned: { label: 'Abandoned', color: 'text-stone-600 bg-stone-900 border-stone-800' },
}

const planColors: Record<LifePlanType, string> = {
  expected: 'text-indigo-400 border-indigo-800 bg-indigo-950/30',
  alternative: 'text-emerald-400 border-emerald-800 bg-emerald-950/30',
  wildcard: 'text-amber-400 border-amber-800 bg-amber-950/30',
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
    const { data } = await supabase
      .from('prototypes')
      .insert({
        ...form,
        scheduled_date: form.scheduled_date || null,
      })
      .select()
      .single()
    if (data) {
      setPrototypes([data, ...prototypes])
      setAdding(false)
      setForm({ ...form, title: '', description: '', notes: '' })
    }
  }

  async function handleStatusChange(id: string, status: PrototypeStatus) {
    const supabase = createClient()
    await supabase.from('prototypes').update({ status }).eq('id', id)
    setPrototypes(prototypes.map(p => p.id === id ? { ...p, status } : p))
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('prototypes').delete().eq('id', id)
    setPrototypes(prototypes.filter(p => p.id !== id))
  }

  function getLifePlanForPrototype(lifePlanId: string) {
    return lifePlans.find((lp: { id: string }) => lp.id === lifePlanId)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold">Prototyping</h2>
          <p className="text-stone-400 text-sm mt-1">
            Test your life paths with small, low-risk experiments before committing.
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add prototype
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleAdd} className="bg-stone-900 border border-stone-700 rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-sm">New prototype</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-400 mb-1">Life path</label>
              <select
                value={form.life_plan_id}
                onChange={e => setForm({ ...form, life_plan_id: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm outline-none"
              >
                {lifePlans.map((lp: { id: string; type: LifePlanType; title: string }) => (
                  <option key={lp.id} value={lp.id}>
                    {LIFE_PLAN_LABELS[lp.type].label}: {lp.title || 'Untitled'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as PrototypeType })}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm outline-none"
              >
                {(Object.entries(TYPE_META) as [PrototypeType, typeof TYPE_META[PrototypeType]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-stone-400 mb-1">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Coffee chat with a product designer"
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-stone-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What will you do? What are you trying to learn?"
              rows={2}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as PrototypeStatus })}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm outline-none"
              >
                {(Object.entries(STATUS_META) as [PrototypeStatus, typeof STATUS_META[PrototypeStatus]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1">Scheduled date</label>
              <input
                type="date"
                value={form.scheduled_date}
                onChange={e => setForm({ ...form, scheduled_date: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-sm text-stone-400 hover:text-stone-200 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            >
              Add prototype
            </button>
          </div>
        </form>
      )}

      {/* Prototype list */}
      {prototypes.length === 0 && !adding ? (
        <div className="text-center py-20 border border-dashed border-stone-700 rounded-2xl">
          <FlaskConical className="w-8 h-8 text-stone-600 mx-auto mb-3" />
          <p className="text-stone-400 text-sm mb-1">No prototypes yet</p>
          <p className="text-stone-600 text-xs max-w-xs mx-auto">
            Add small experiments, interviews, or side projects to test each life path before committing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {prototypes.map(p => {
            const lp = getLifePlanForPrototype(p.life_plan_id)
            const typeMeta = TYPE_META[p.type]
            const statusMeta = STATUS_META[p.status]
            const planColor = lp ? planColors[lp.type as LifePlanType] : ''
            return (
              <div key={p.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {lp && (
                        <span className={cn('text-xs font-medium border rounded-full px-2.5 py-0.5', planColor)}>
                          {LIFE_PLAN_LABELS[lp.type as LifePlanType].label}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-stone-400 bg-stone-800 rounded-full px-2.5 py-0.5">
                        {typeMeta.icon}
                        {typeMeta.label}
                      </span>
                      <select
                        value={p.status}
                        onChange={e => handleStatusChange(p.id, e.target.value as PrototypeStatus)}
                        className={cn('text-xs border rounded-full px-2.5 py-0.5 outline-none cursor-pointer', statusMeta.color)}
                      >
                        {(Object.entries(STATUS_META) as [PrototypeStatus, typeof STATUS_META[PrototypeStatus]][]).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    {p.description && (
                      <p className="text-stone-400 text-xs mt-1 leading-relaxed">{p.description}</p>
                    )}
                    {p.scheduled_date && (
                      <p className="text-xs text-stone-500 mt-2">
                        Scheduled: {new Date(p.scheduled_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-stone-700 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
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
