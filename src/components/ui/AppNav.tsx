'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'

interface AppNavProps {
  user: User
}

export default function AppNav({ user }: AppNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav style={{
      width: 200,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      borderRight: '1px solid var(--ql-rule)',
      background: 'var(--ql-paper-deep)',
    }}>
      <div style={{ padding: '0 20px', marginBottom: 32 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ql-ink-soft)',
          lineHeight: 1.4,
        }}>
          The Great Odyssey
        </div>
        <div style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 16,
          color: 'var(--ql-ink-faint)',
          marginTop: 2,
        }}>
          Vol. I
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <NavItem
          href="/dashboard"
          label="Dashboard"
          active={pathname === '/dashboard'}
          icon={<LayoutDashboard style={{ width: 14, height: 14 }} />}
        />
      </div>

      <button
        onClick={handleSignOut}
        title={`Sign out (${user.email})`}
        style={{
          margin: '0 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: 11,
          letterSpacing: '0.05em',
          color: 'var(--ql-ink-faint)',
          padding: '4px 0',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Sign out
      </button>
    </nav>
  )
}

function NavItem({ href, icon, label, active }: {
  href: string
  icon: ReactNode
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 20px',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        color: active ? 'var(--ql-ink)' : 'var(--ql-ink-soft)',
        borderLeft: active ? '2px solid var(--ql-ink)' : '2px solid transparent',
        textDecoration: 'none',
      }}
    >
      {icon}
      {label}
    </Link>
  )
}
