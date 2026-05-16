'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { type LifePlanType, type OdysseyPlan } from '@/lib/types'
import LifePlanEditor from './LifePlanEditor'
import AiGuide from '../ai-guide/AiGuide'
import { MessageCircle, X } from 'lucide-react'

interface WizardShellProps {
  odysseyPlan: OdysseyPlan
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']

export default function WizardShell({ odysseyPlan }: WizardShellProps) {
  const searchParams = useSearchParams()
  const activeType = (searchParams.get('life') ?? 'expected') as LifePlanType
  const [aiOpen, setAiOpen] = useState(false)

  return (
    <div className="flex h-full">
      {/* Main editor area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {PLAN_TYPES.map(type => {
          const plan = odysseyPlan.life_plans?.find(lp => lp.type === type)
          if (!plan) return null
          return (
            <div key={type} style={{ display: activeType === type ? 'block' : 'none' }}>
              <LifePlanEditor lifePlan={plan} type={type} />
            </div>
          )
        })}
      </div>

      {/* AI guide — desktop: 384px flex child (sm+) */}
      {aiOpen && (
        <div
          className="hidden sm:flex"
          style={{
            width: 384,
            borderLeft: '1px solid var(--ql-rule)',
            flexDirection: 'column',
            flexShrink: 0,
            background: 'var(--ql-paper-deep)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--ql-rule)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: 'var(--ql-ink)' }}>the guide</span>
              <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', fontFamily: "'Inter', sans-serif" }}>AI</span>
            </div>
            <button
              onClick={() => setAiOpen(false)}
              aria-label="Close AI Guide"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ql-ink-faint)', display: 'flex' }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
          {(() => {
            const plan = odysseyPlan.life_plans?.find(lp => lp.type === activeType)
            return plan
              ? <AiGuide lifePlanId={plan.id} lifePlanType={activeType} />
              : <p style={{ padding: 16, fontSize: 13, color: 'var(--ql-ink-faint)' }}>No plan selected.</p>
          })()}
        </div>
      )}

      {/* AI guide — mobile: full-screen overlay (<640px) */}
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--ql-rule)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: 'var(--ql-ink)' }}>the guide</span>
              <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ql-ink-faint)', fontFamily: "'Inter', sans-serif" }}>AI</span>
            </div>
            <button
              onClick={() => setAiOpen(false)}
              aria-label="Close AI Guide"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ql-ink-faint)', display: 'flex' }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
          {(() => {
            const plan = odysseyPlan.life_plans?.find(lp => lp.type === activeType)
            return plan
              ? <AiGuide lifePlanId={plan.id} lifePlanType={activeType} />
              : <p style={{ padding: 16, fontSize: 13, color: 'var(--ql-ink-faint)' }}>No plan selected.</p>
          })()}
        </div>
      )}

      {/* FAB — shows when AI guide is closed */}
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
