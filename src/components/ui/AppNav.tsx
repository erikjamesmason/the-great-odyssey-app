'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Menu, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { QLWordmark } from '@/components/ui/QLComponents'

interface AppNavProps {
  user: User
}

export default function AppNav({ user }: AppNavProps) {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* hamburger — mobile only, fixed top-left */}
      <button
        onClick={() => setNavOpen(true)}
        aria-label="Open navigation"
        className="flex sm:hidden"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 60,
          background: 'var(--ql-paper-deep)',
          border: '1px solid var(--ql-rule)',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 6,
          color: 'var(--ql-ink-soft)',
        }}
      >
        <Menu style={{ width: 16, height: 16 }} />
      </button>

      {/* backdrop — mobile only when drawer is open */}
      {navOpen && (
        <div
          className="sm:hidden"
          onClick={() => setNavOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(13,12,8,0.35)',
            zIndex: 40,
          }}
        />
      )}

      {/* nav — fixed drawer on mobile, static sidebar on desktop */}
      <nav
        className={[
          'fixed top-0 bottom-0 left-0',
          'transition-transform duration-200 ease-in-out',
          navOpen ? 'translate-x-0' : '-translate-x-full',
          'sm:static sm:translate-x-0 sm:transition-none',
        ].join(' ')}
        style={{
          width: 200,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '0 0 24px',
          borderRight: '1px solid var(--ql-rule)',
          background: 'var(--ql-paper-deep)',
          zIndex: 50,
        }}
      >
        <div style={{ padding: '12px 12px 16px 16px', borderBottom: '1px solid var(--ql-rule)', marginBottom: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <QLWordmark size={28} />
            <div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--ql-ink)',
              }}>
                The Great Odyssey
              </div>
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 13,
                color: 'var(--ql-ink-faint)',
                marginTop: 1,
              }}>
                your chart
              </div>
            </div>
          </div>

          {/* close button — mobile only, inline in header row */}
          <button
            onClick={() => setNavOpen(false)}
            aria-label="Close navigation"
            className="flex sm:hidden"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ql-ink-faint)',
              padding: 4,
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <NavItem
            href="/dashboard"
            label="Dashboard"
            active={pathname === '/dashboard'}
            icon={<LayoutDashboard style={{ width: 14, height: 14 }} />}
            onClick={() => setNavOpen(false)}
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
    </>
  )
}

function NavItem({ href, icon, label, active, onClick }: {
  href: string
  icon: ReactNode
  label: string
  active: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
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
