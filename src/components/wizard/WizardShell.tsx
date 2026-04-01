'use client'

import { useState } from 'react'
import { LIFE_PLAN_LABELS, type LifePlanType } from '@/lib/types'
import { cn } from '@/lib/utils'
import LifePlanEditor from './LifePlanEditor'
import AiGuide from '../ai-guide/AiGuide'
import { MessageCircle, X } from 'lucide-react'

interface WizardShellProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  odysseyPlan: any
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']

export default function WizardShell({ odysseyPlan }: WizardShellProps) {
  const [activeType, setActiveType] = useState<LifePlanType>('expected')
  const [aiOpen, setAiOpen] = useState(false)

  const activePlan = odysseyPlan.life_plans?.find((lp: { type: string }) => lp.type === activeType)

  return (
    <div className="flex h-full">
      {/* Main wizard area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Life selector tabs */}
        <div className="flex border-b border-stone-800 px-6 pt-6 gap-2">
          {PLAN_TYPES.map(type => {
            const meta = LIFE_PLAN_LABELS[type]
            const colorMap = {
              expected: 'border-indigo-500 text-indigo-300',
              alternative: 'border-emerald-500 text-emerald-300',
              wildcard: 'border-amber-500 text-amber-300',
            }
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={cn(
                  'px-5 py-3 text-sm font-medium rounded-t-xl border-b-2 transition-colors',
                  activeType === type
                    ? colorMap[type]
                    : 'border-transparent text-stone-500 hover:text-stone-300'
                )}
              >
                <span className="font-semibold">{meta.label}</span>
                <span className="hidden sm:inline text-xs ml-2 opacity-60">— {meta.description}</span>
              </button>
            )
          })}
        </div>

        {/* Plan editor */}
        <div className="flex-1 overflow-auto p-6">
          {activePlan ? (
            <LifePlanEditor lifePlan={activePlan} type={activeType} />
          ) : (
            <p className="text-stone-500 text-sm">No plan found for this type.</p>
          )}
        </div>
      </div>

      {/* AI Guide panel */}
      {aiOpen ? (
        <div className="w-96 border-l border-stone-800 flex flex-col shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
            <span className="text-sm font-semibold">AI Guide</span>
            <button onClick={() => setAiOpen(false)} className="text-stone-500 hover:text-stone-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <AiGuide lifePlanId={activePlan?.id} lifePlanType={activeType} />
        </div>
      ) : (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 rounded-full p-3.5 shadow-lg shadow-indigo-900/50 transition-colors z-10 flex items-center gap-2 pr-5"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">AI Guide</span>
        </button>
      )}
    </div>
  )
}
