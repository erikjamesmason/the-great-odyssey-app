import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CreatePlanButton from '@/components/ui/CreatePlanButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: plans } = await supabase
    .from('odyssey_plans')
    .select('*, life_plans(id, type, title, gauge_resources, gauge_likeability, gauge_confidence, gauge_coherence)')
    .order('created_at', { ascending: false })

  const LIFE_TYPES = ['expected', 'alternative', 'wildcard'] as const
  const LIFE_LABELS = ['Life I', 'Life II', 'Life III']
  const LIFE_COLORS = ['var(--ql-l1)', 'var(--ql-l2)', 'var(--ql-l3)']

  return (
    <div className="px-4 py-10 sm:px-8" style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Frontispiece header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--ql-ink-faint)',
          marginBottom: 14,
        }}>
          The Great Odyssey
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
          <h1 style={{ fontSize: 26, fontWeight: 300, color: 'var(--ql-ink)', margin: 0, letterSpacing: '-0.02em' }}>
            Your Odysseys
          </h1>
          <CreatePlanButton />
        </div>
        <div style={{ height: 1, background: 'var(--ql-rule)' }} />
        <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', marginTop: 8 }}>
          Each odyssey contains three radically different life plans.
        </p>
      </div>

      {/* Plans list */}
      {!plans || plans.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 20px',
          borderTop: '1px solid var(--ql-rule)',
          borderBottom: '1px solid var(--ql-rule)',
        }}>
          <p style={{ fontSize: 14, color: 'var(--ql-ink-soft)', marginBottom: 8, fontWeight: 400 }}>
            No odysseys yet
          </p>
          <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', marginBottom: 24, maxWidth: 280, margin: '0 auto 24px' }}>
            Start by creating your first Odyssey Plan — three possible futures waiting to be imagined.
          </p>
          <CreatePlanButton label="Create your first odyssey" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {plans.map(plan => (
            <Link
              key={plan.id}
              href={`/plans/${plan.id}/wizard`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{
                background: 'var(--ql-paper-deep)',
                border: '1px solid var(--ql-rule)',
                padding: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 500, color: 'var(--ql-ink)', margin: 0 }}>
                      {plan.name}
                    </h2>
                    <p style={{ fontSize: 11, color: 'var(--ql-ink-faint)', marginTop: 3 }}>
                      Created {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 11,
                    color: 'var(--ql-ink-faint)',
                    border: '1px solid var(--ql-rule)',
                    padding: '2px 10px',
                  }}>
                    {plan.life_plans?.length ?? 0}/3 lives
                  </span>
                </div>

                {/* Three life columns with ink-line markers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-px">
                  {LIFE_TYPES.map((type, idx) => {
                    const lp = plan.life_plans?.find((l: { type: string }) => l.type === type)
                    const color = LIFE_COLORS[idx]
                    const gauges = lp ? [
                      lp.gauge_resources ?? 0,
                      lp.gauge_likeability ?? 0,
                      lp.gauge_confidence ?? 0,
                      lp.gauge_coherence ?? 0,
                    ] : []
                    return (
                      <div key={type} style={{
                        borderLeft: `3px solid ${color}`,
                        padding: '10px 12px',
                        background: 'var(--ql-paper)',
                      }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}>
                          {LIFE_LABELS[idx]}
                        </span>
                        <p style={{
                          fontSize: 13,
                          marginTop: 4,
                          color: lp?.title ? 'var(--ql-ink-soft)' : 'var(--ql-ink-faint)',
                          fontStyle: lp?.title ? 'normal' : 'italic',
                        }}>
                          {lp?.title || 'Not started'}
                        </p>
                        {gauges.length > 0 && (
                          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {gauges.map((v, gi) => (
                              <div key={gi} style={{ height: 1, background: 'var(--ql-rule)', position: 'relative' }}>
                                <div style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  height: 1,
                                  width: `${v}%`,
                                  background: color,
                                }} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
