'use client'

import { useState } from 'react'
import { LIFE_PLAN_LABELS, type LifePlanType, type OdysseyPlan } from '@/lib/types'
import LifePlanEditor from './LifePlanEditor'
import AiGuide from '../ai-guide/AiGuide'
import { MessageCircle, X } from 'lucide-react'

interface WizardShellProps {
  odysseyPlan: OdysseyPlan
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']

const QL_COLORS: Record<LifePlanType, string> = {
  expected: 'var(--ql-l1)',
  alternative: 'var(--ql-l2)',
  wildcard: 'var(--ql-l3)',
}

export default function WizardShell({ odysseyPlan }: WizardShellProps) {
  const [activeType, setActiveType] = useState<LifePlanType>('expected')
  const [aiOpen, setAiOpen] = useState(false)

  const activePlan = odysseyPlan.life_plans?.find(lp => lp.type === activeType)

  return (
    <div className="flex h-full">
      {/* Main wizard area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Life selector tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--ql-rule)',
          padding: '0 24px',
          paddingTop: 0,
          gap: 0,
        }}>
          {PLAN_TYPES.map(type => {
            const meta = LIFE_PLAN_LABELS[type]
            const color = QL_COLORS[type]
            const active = activeType === type
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                style={{
                  padding: '14px 20px',
                  fontSize: 12,
                  fontWeight: active ? 500 : 400,
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
                  color: active ? 'var(--ql-ink)' : 'var(--ql-ink-faint)',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span style={{ fontWeight: 600 }}>{meta.label}</span>
                <span className="hidden sm:inline" style={{ fontSize: 11, marginLeft: 8, opacity: 0.6 }}>
                  — {meta.description}
                </span>
              </button>
            )
          })}
        </div>

        {/* Plan editor */}
        <div className="flex-1 overflow-auto" style={{ padding: 24 }}>
          {activePlan ? (
            <LifePlanEditor lifePlan={activePlan} type={activeType} />
          ) : (
            <p style={{ fontSize: 13, color: 'var(--ql-ink-faint)' }}>No plan found for this type.</p>
          )}
        </div>
      </div>

      {/* AI Guide panel */}
      {aiOpen ? (
        <div style={{
          width: 384,
          borderLeft: '1px solid var(--ql-rule)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          background: 'var(--ql-paper-deep)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--ql-rule)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ql-ink)' }}>AI Guide</span>
            <button
              onClick={() => setAiOpen(false)}
              aria-label="Close AI Guide"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ql-ink-faint)', display: 'flex' }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
          {activePlan
            ? <AiGuide lifePlanId={activePlan.id} lifePlanType={activeType} />
            : <p style={{ padding: 16, fontSize: 13, color: 'var(--ql-ink-faint)' }}>No plan selected.</p>
          }
        </div>
      ) : (
        <button
          onClick={() => setAiOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
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
          AI Guide
        </button>
      )}
    </div>
  )
}
