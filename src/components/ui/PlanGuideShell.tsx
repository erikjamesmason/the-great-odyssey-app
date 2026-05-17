'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageCircle, X } from 'lucide-react'
import AiGuide from '@/components/ai-guide/AiGuide'
import type { LifePlanType } from '@/lib/types'

interface LifePlanStub {
  id: string
  type: string
}

interface PlanGuideShellProps {
  children: React.ReactNode
  lifePlans: LifePlanStub[]
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']

export default function PlanGuideShell({ children, lifePlans }: PlanGuideShellProps) {
  const [aiOpen, setAiOpen] = useState(false)
  const searchParams = useSearchParams()

  const paramLife = searchParams.get('life') as LifePlanType | null
  const activeType: LifePlanType =
    paramLife && PLAN_TYPES.includes(paramLife) ? paramLife : 'expected'
  const activePlan = lifePlans.find(lp => lp.type === activeType) ?? lifePlans[0]

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid var(--ql-rule)',
    flexShrink: 0,
  }

  const guideHeader = (
    <div style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: 'var(--ql-ink)' }}>
          the guide
        </span>
        <span style={{
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ql-ink-faint)',
          fontFamily: "'Inter', sans-serif",
        }}>
          AI
        </span>
      </div>
      <button
        onClick={() => setAiOpen(false)}
        aria-label="Close guide"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ql-ink-faint)', display: 'flex' }}
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  )

  const guideContent = activePlan
    ? <AiGuide lifePlanId={activePlan.id} lifePlanType={activePlan.type as LifePlanType} />
    : <p style={{ padding: 16, fontSize: 13, color: 'var(--ql-ink-faint)', fontFamily: "'Inter', sans-serif" }}>No plan data.</p>

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 overflow-auto pb-16 sm:pb-0 min-w-0">
        {children}
      </div>

      {/* Desktop guide panel */}
      {aiOpen && (
        <div
          className="hidden sm:flex"
          style={{
            width: 360,
            borderLeft: '1px solid var(--ql-rule)',
            flexDirection: 'column',
            flexShrink: 0,
            background: 'var(--ql-paper-deep)',
          }}
        >
          {guideHeader}
          {guideContent}
        </div>
      )}

      {/* Mobile guide overlay */}
      {aiOpen && (
        <div
          className="flex sm:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            flexDirection: 'column',
            background: 'var(--ql-paper-deep)',
          }}
        >
          {guideHeader}
          {guideContent}
        </div>
      )}

      {/* FAB */}
      {!aiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          style={{
            position: 'fixed',
            bottom: 80,
            right: 24,
            background: 'var(--ql-ink)',
            color: 'var(--ql-paper)',
            border: 'none',
            padding: '10px 16px 10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            zIndex: 10,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <MessageCircle style={{ width: 15, height: 15 }} />
          the guide
        </button>
      )}
    </div>
  )
}
