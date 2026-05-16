import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { QLWordmark, QLSeal, QLOrnament, QLPageFoot } from '@/components/ui/QLComponents'
import { HAND_LABELS, LIFE_NUMERALS, LIFE_SEAL_IDS, QL_COLORS } from '@/lib/types'
import type { LifePlanType } from '@/lib/types'

export default async function PlanTodayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: plan } = await supabase
    .from('odyssey_plans')
    .select('*, life_plans(*, prototypes(*))')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!plan) redirect('/dashboard')

  type LifeRow = {
    id: string
    type: LifePlanType
    title: string
    gauge_resources: number
    gauge_likeability: number
    gauge_confidence: number
    gauge_coherence: number
    prototypes: Array<{ id: string; title: string; status: string }>
  }

  const lives = (plan.life_plans ?? []) as LifeRow[]

  const recentPrototypes = lives
    .flatMap(l => (l.prototypes ?? []).map(p => ({ ...p, lifeType: l.type })))
    .filter(p => p.status === 'in_progress')
    .slice(0, 3)

  return (
    <div style={{
      minHeight: '100%',
      background: 'var(--ql-paper)',
      padding: '40px 32px',
      maxWidth: 640,
    }}>
      {/* frontispiece header */}
      <div style={{ marginBottom: 32 }}>
        <QLWordmark size={36} />
        <h1 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 22,
          fontWeight: 400,
          color: 'var(--ql-ink)',
          margin: '16px 0 4px',
        }}>
          {plan.name || 'Untitled Odyssey'}
        </h1>
        <div style={{
          marginTop: 8,
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ql-ink-faint)',
          fontFamily: "'Inter', sans-serif",
        }}>
          {new Date(plan.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <QLOrnament width={200} />

      {/* three lives summary */}
      <div style={{ marginTop: 32 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ql-ink-faint)',
          fontFamily: "'Inter', sans-serif",
          marginBottom: 16,
        }}>
          Three lives
        </div>

        {lives.map(life => {
          const color = QL_COLORS[life.type]
          const sealId = LIFE_SEAL_IDS[life.type]
          const numeral = LIFE_NUMERALS[life.type]
          const handLabel = HAND_LABELS[life.type]
          const avgGauge = Math.round(
            (life.gauge_resources + life.gauge_likeability + life.gauge_confidence + life.gauge_coherence) / 4
          )
          return (
            <Link
              key={life.id}
              href={`/plans/${id}/wizard?life=${life.type}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '16px 0',
                borderBottom: '1px solid var(--ql-rule)',
                textDecoration: 'none',
              }}
            >
              <QLSeal id={sealId} size={40} color={color} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 18,
                    color,
                  }}>{numeral}</span>
                  <span style={{
                    fontSize: 11,
                    color: 'var(--ql-ink-faint)',
                    fontFamily: "'Inter', sans-serif",
                    fontStyle: 'italic',
                  }}>{handLabel}</span>
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: 'var(--ql-ink)',
                  marginTop: 2,
                }}>
                  {life.title || 'Untitled'}
                </div>
                <div style={{
                  marginTop: 8,
                  height: 3,
                  background: 'var(--ql-rule)',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${avgGauge}%`,
                    background: color,
                    opacity: 0.6,
                  }} />
                </div>
              </div>
              <div style={{
                fontSize: 14,
                color: 'var(--ql-ink-faint)',
                fontFamily: "'Caveat', cursive",
                alignSelf: 'center',
              }}>
                {avgGauge}
              </div>
            </Link>
          )
        })}
      </div>

      {/* underway */}
      {recentPrototypes.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ql-ink-faint)',
            fontFamily: "'Inter', sans-serif",
            marginBottom: 12,
          }}>
            Underway
          </div>
          {recentPrototypes.map(p => (
            <div key={p.id} style={{
              padding: '8px 0',
              borderBottom: '1px solid var(--ql-rule)',
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: 'var(--ql-ink-soft)',
            }}>
              {p.title}
            </div>
          ))}
        </div>
      )}

      <QLPageFoot folio={`${plan.name || 'Odyssey'} · Today`} />
    </div>
  )
}
