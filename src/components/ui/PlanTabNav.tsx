'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { QLSeal } from '@/components/ui/QLComponents'
import type { LifePlanType } from '@/lib/types'

const QL_COLORS: Record<LifePlanType, string> = {
  expected: 'var(--ql-l1)',
  alternative: 'var(--ql-l2)',
  wildcard: 'var(--ql-l3)',
}

const LIFE_SEAL_IDS: Record<LifePlanType, 'L1' | 'L2' | 'L3'> = {
  expected: 'L1',
  alternative: 'L2',
  wildcard: 'L3',
}

interface PlanTabNavProps {
  planId: string
  planName: string
}

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
    padding: '10px 16px',
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    fontWeight: active ? 600 : 400,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: active ? 'var(--ql-ink)' : 'var(--ql-ink-faint)',
    textDecoration: 'none',
    borderLeft: active ? '2px solid var(--ql-ink)' : '2px solid transparent',
    background: active ? 'var(--ql-paper-deep)' : 'none',
  })

  const lifeTab = (type: LifePlanType, numeral: string, handLabel: string) => {
    const active = isActive('wizard', type)
    const color = QL_COLORS[type]
    return (
      <Link href={`${base}/wizard?life=${type}`} style={tabStyle(active)}>
        <QLSeal id={LIFE_SEAL_IDS[type]} size={18} color={color} />
        <span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 14, marginRight: 4, color: active ? color : 'var(--ql-ink-faint)' }}>
            {numeral}
          </span>
          <span className="hidden sm:inline">{handLabel}</span>
        </span>
      </Link>
    )
  }

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

        {lifeTab('expected', 'I', 'Life I')}
        {lifeTab('alternative', 'II', 'Life II')}
        {lifeTab('wildcard', 'III', 'Life III')}

        <div style={{ borderTop: '1px solid var(--ql-rule)', margin: '4px 0' }} />

        <Link href={`${base}/timeline`} style={tabStyle(isActive('timeline'))}>Foldout</Link>
        <Link href={`${base}/roadmap`} style={tabStyle(isActive('roadmap'))}>The line</Link>
        <Link href={`${base}/prototype`} style={tabStyle(isActive('prototype'))}>Underway</Link>
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
          { href: `${base}/roadmap`, label: 'Line' },
          { href: `${base}/prototype`, label: 'Now' },
          { href: `${base}/reflections`, label: 'Notes' },
        ] as const).map(({ href, label }) => (
          <Link key={href} href={href} style={{
            flex: 1,
            minWidth: 40,
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
