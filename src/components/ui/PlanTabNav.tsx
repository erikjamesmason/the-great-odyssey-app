'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wand2, Rows3, Network, FlaskConical, ChevronLeft } from 'lucide-react'

interface PlanTabNavProps {
  planId: string
  planName: string
}

const tabs = [
  { label: 'Wizard',    href: 'wizard',    icon: <Wand2        style={{ width: 13, height: 13 }} /> },
  { label: 'Timeline',  href: 'timeline',  icon: <Rows3        style={{ width: 13, height: 13 }} /> },
  { label: 'Roadmap',   href: 'roadmap',   icon: <Network      style={{ width: 13, height: 13 }} /> },
  { label: 'Prototype', href: 'prototype', icon: <FlaskConical style={{ width: 13, height: 13 }} /> },
]

export default function PlanTabNav({ planId, planName }: PlanTabNavProps) {
  const pathname = usePathname()

  return (
    <div style={{
      borderBottom: '1px solid var(--ql-rule)',
      background: 'var(--ql-paper-deep)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      flexShrink: 0,
    }}>
      <Link
        href="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          color: 'var(--ql-ink-faint)',
          textDecoration: 'none',
          marginRight: 8,
        }}
      >
        <ChevronLeft style={{ width: 14, height: 14 }} />
        <span className="hidden sm:block">{planName}</span>
      </Link>

      <div style={{ display: 'flex' }}>
        {tabs.map(tab => {
          const href = `/plans/${planId}/${tab.href}`
          const active = pathname.startsWith(href)
          return (
            <Link
              key={tab.href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '14px 16px',
                fontSize: 12,
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--ql-ink)' : 'var(--ql-ink-faint)',
                borderBottom: active ? '2px solid var(--ql-ink)' : '2px solid transparent',
                textDecoration: 'none',
              }}
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
