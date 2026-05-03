'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X } from 'lucide-react'

interface CreatePlanButtonProps {
  label?: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--ql-paper)',
  border: '1px solid var(--ql-rule)',
  padding: '10px 12px',
  fontSize: 14,
  color: 'var(--ql-ink)',
  outline: 'none',
  fontFamily: "'Inter', sans-serif",
  boxSizing: 'border-box',
}

export default function CreatePlanButton({ label = 'New odyssey' }: CreatePlanButtonProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showModal) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [showModal])

  function openModal() {
    setName('')
    setError(null)
    setShowModal(true)
  }

  function closeModal() {
    if (loading) return
    setShowModal(false)
  }

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Give it a name.'); return }

    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); setError('Not signed in.'); return }

    const { data: plan, error: planError } = await supabase
      .from('odyssey_plans')
      .insert({ user_id: user.id, name: trimmed })
      .select()
      .single()

    if (planError || !plan) {
      setLoading(false)
      setError('Something went wrong. Try again.')
      return
    }

    await supabase.from('life_plans').insert([
      { odyssey_plan_id: plan.id, type: 'expected' },
      { odyssey_plan_id: plan.id, type: 'alternative' },
      { odyssey_plan_id: plan.id, type: 'wildcard' },
    ])

    router.push(`/plans/${plan.id}/wizard`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') closeModal()
  }

  return (
    <>
      <button
        onClick={openModal}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: '1px solid var(--ql-ink)',
          padding: '8px 16px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ql-ink)',
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Plus style={{ width: 13, height: 13 }} />
        {label}
      </button>

      {showModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(13,12,8,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--ql-paper)',
              border: '1px solid var(--ql-rule)',
              width: '100%',
              maxWidth: 420,
              padding: 28,
              margin: '0 16px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <p style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--ql-ink-faint)', margin: '0 0 4px',
                }}>
                  New Odyssey
                </p>
                <h2 style={{ fontSize: 17, fontWeight: 400, color: 'var(--ql-ink)', margin: 0 }}>
                  Name your plan
                </h2>
              </div>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--ql-ink-faint)' }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', marginBottom: 16 }}>
              This is the container for your three life paths. Something like <em>&ldquo;My 2026 Odyssey&rdquo;</em> works fine.
            </p>

            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. My 2026 Odyssey"
              value={name}
              onChange={e => { setName(e.target.value); setError(null) }}
              onKeyDown={handleKeyDown}
              maxLength={80}
              style={inputStyle}
            />

            {error && (
              <p style={{ fontSize: 12, color: '#c0392b', marginTop: 6 }}>{error}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button
                onClick={closeModal}
                disabled={loading}
                style={{
                  background: 'none',
                  border: '1px solid var(--ql-rule)',
                  padding: '8px 18px',
                  fontSize: 12,
                  color: 'var(--ql-ink-soft)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                style={{
                  background: loading || !name.trim() ? 'var(--ql-ink-faint)' : 'var(--ql-ink)',
                  border: 'none',
                  padding: '8px 18px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--ql-paper)',
                  cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.04em',
                }}
              >
                {loading ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
