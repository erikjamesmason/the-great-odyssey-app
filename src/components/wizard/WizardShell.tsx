'use client'

import { useSearchParams } from 'next/navigation'
import { type LifePlanType, type OdysseyPlan } from '@/lib/types'
import LifePlanEditor from './LifePlanEditor'

interface WizardShellProps {
  odysseyPlan: OdysseyPlan
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']

export default function WizardShell({ odysseyPlan }: WizardShellProps) {
  const searchParams = useSearchParams()
  const activeType = (searchParams.get('life') ?? 'expected') as LifePlanType

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {PLAN_TYPES.map(type => {
        const plan = odysseyPlan.life_plans?.find(lp => lp.type === type)
        if (!plan) return null
        return (
          <div key={type} style={{ display: activeType === type ? 'block' : 'none', height: '100%' }}>
            <LifePlanEditor lifePlan={plan} type={type} />
          </div>
        )
      })}
    </div>
  )
}
