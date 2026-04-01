'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Compass, LayoutDashboard, LogOut } from 'lucide-react'
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
    <nav className="w-16 flex flex-col items-center py-6 border-r border-stone-800 bg-stone-950 shrink-0">
      <Link href="/dashboard" className="mb-8">
        <Compass className="w-7 h-7 text-indigo-400" />
      </Link>

      <div className="flex-1 flex flex-col items-center gap-2">
        <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={pathname === '/dashboard'} />
      </div>

      <button
        onClick={handleSignOut}
        title={`Sign out (${user.email})`}
        className="text-stone-500 hover:text-stone-300 transition-colors"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </nav>
  )
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
        active ? 'bg-indigo-600 text-white' : 'text-stone-500 hover:text-stone-200 hover:bg-stone-800'
      )}
    >
      {icon}
    </Link>
  )
}
