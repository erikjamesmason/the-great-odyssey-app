'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">The Great Odyssey</h1>
          <p className="text-stone-400 text-sm">Three lives. One remarkable future.</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">Sign in</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-stone-400 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-2.5 text-sm font-medium transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-sm text-stone-400 mt-6">
            No account?{' '}
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
