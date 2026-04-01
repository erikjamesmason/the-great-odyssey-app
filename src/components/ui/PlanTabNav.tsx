'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Wand2, Rows3, Network, FlaskConical, ChevronLeft } from 'lucide-react'

interface PlanTabNavProps {
  planId: string
  planName: string
}

const tabs = [
  { label: 'Wizard', href: 'wizard', icon: <Wand2 className="w-4 h-4" /> },
  { label: 'Timeline', href: 'timeline', icon: <Rows3 className="w-4 h-4" /> },
  { label: 'Roadmap', href: 'roadmap', icon: <Network className="w-4 h-4" /> },
  { label: 'Prototype', href: 'prototype', icon: <FlaskConical className="w-4 h-4" /> },
]

export default function PlanTabNav({ planId, planName }: PlanTabNavProps) {
  const pathname = usePathname()

  return (
    <div className="border-b border-stone-800 bg-stone-950 px-6 py-0 flex items-center gap-6 shrink-0">
      <Link href="/dashboard" className="flex items-center gap-1 text-stone-500 hover:text-stone-300 transition-colors text-sm mr-2">
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:block">{planName}</span>
      </Link>

      <div className="flex">
        {tabs.map(tab => {
          const href = `/plans/${planId}/${tab.href}`
          const active = pathname.startsWith(href)
          return (
            <Link
              key={tab.href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-4 text-sm border-b-2 transition-colors',
                active
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-stone-500 hover:text-stone-300'
              )}
            >
              {tab.icon}
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
