'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { QLSeal } from '@/components/ui/QLComponents'
import { QL_COLORS, LIFE_SEAL_IDS, LIFE_NUMERALS, HAND_LABELS, type LifePlanType } from '@/lib/types'

interface PlanTabNavProps {
  planId: string
  planName: string
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']

export default function PlanTabNav({ planId, planName }: PlanTabNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentLife = searchParams.get('life') ?? ''

  const base = `/plans/${planId}`

  function seg() {
    const after = pathname.replace(base, '')
    return after.split('/')[1] ?? ''
  }

  function isActive(path: string, life?: string) {
    const s = seg()
    if (path === '' && s === '') return !life || currentLife === life
    if (path === 'wizard') return s === 'wizard' && (!life || currentLife === life)
    return s === path
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 16px',
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    fontWeight: active ? 600 : 400,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: active ? 'var(--ql-ink)' : 'var(--ql-ink-soft)',
    textDecoration: 'none',
    borderLeft: active ? '2px solid var(--ql-ink)' : '2px solid transparent',
    background: active ? 'var(--ql-paper-deep)' : 'none',
  })

  return (
    <>
      {/* desktop sidebar */}
      <nav
        className="hidden sm:flex"
        style={{
          width: 200,
          minWidth: 200,
          background: 'var(--ql-paper)',
          borderRight: '1px solid var(--ql-rule)',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          flexShrink: 0,
        }}
      >
        <Link href="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '12px 16px',
          fontSize: 11,
          color: 'var(--ql-ink-faint)',
          textDecoration: 'none',
          borderBottom: '1px solid var(--ql-rule)',
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          <ArrowLeft style={{ width: 12, height: 12 }} />
          {planName || 'Plans'}
        </Link>

        <Link href={base} style={tabStyle(isActive(''))}>Today</Link>

        <div style={{ borderTop: '1px solid var(--ql-rule)', margin: '4px 0' }} />

        {PLAN_TYPES.map(type => {
          const active = isActive('wizard', type)
          const color = QL_COLORS[type]
          return (
            <Link key={type} href={`${base}/wizard?life=${type}`} style={tabStyle(active)}>
              <QLSeal id={LIFE_SEAL_IDS[type]} size={16} color={active ? color : 'var(--ql-ink-faint)'} />
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: active ? color : 'var(--ql-ink-soft)', lineHeight: 1 }}>
                  {LIFE_NUMERALS[type]}
                </span>
                <span style={{ fontSize: 10, color: active ? 'var(--ql-ink-soft)' : 'var(--ql-ink-faint)', letterSpacing: '0.04em', fontStyle: 'italic', textTransform: 'none', fontWeight: 400 }}>
                  {HAND_LABELS[type]}
                </span>
              </span>
            </Link>
          )
        })}

        <div style={{ borderTop: '1px solid var(--ql-rule)', margin: '4px 0' }} />

        <Link href={`${base}/timeline`} style={tabStyle(isActive('timeline'))}>Foldout</Link>
        <Link href={`${base}/roadmap`} style={tabStyle(isActive('roadmap'))}>Roadmap</Link>
        <Link href={`${base}/prototype`} style={tabStyle(isActive('prototype'))}>Prototypes</Link>
        <Link href={`${base}/reflections`} style={tabStyle(isActive('reflections'))}>Marginalia</Link>
      </nav>

      {/* mobile bottom bar */}
      <nav
        className="flex sm:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--ql-paper)',
          borderTop: '1px solid var(--ql-rule)',
          zIndex: 40,
          overflowX: 'auto',
        }}
      >
        {([
          { href: base, label: 'Today' },
          { href: `${base}/wizard?life=expected`, label: 'I' },
          { href: `${base}/wizard?life=alternative`, label: 'II' },
          { href: `${base}/wizard?life=wildcard`, label: 'III' },
          { href: `${base}/timeline`, label: 'Fold' },
          { href: `${base}/roadmap`, label: 'Road' },
          { href: `${base}/prototype`, label: 'Proto' },
          { href: `${base}/reflections`, label: 'Notes' },
        ] as const).map(({ href, label }) => (
          <Link key={href} href={href} style={{
            flex: 1,
            minWidth: 36,
            padding: '10px 4px',
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ql-ink-soft)',
            textDecoration: 'none',
          }}>
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}
