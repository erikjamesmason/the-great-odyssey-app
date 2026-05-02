'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        background: 'var(--ql-paper)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: 28, marginBottom: 16 }}>✉</div>
          <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--ql-ink)', marginBottom: 10 }}>
            Check your email
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ql-ink-faint)', lineHeight: 1.6 }}>
            We sent a confirmation link to{' '}
            <span style={{ color: 'var(--ql-ink-soft)' }}>{email}</span>.
            Click it to activate your account and begin your odyssey.
          </p>
          <Link
            href="/login"
            style={{ display: 'inline-block', marginTop: 24, fontSize: 12, color: 'var(--ql-ink-soft)', textUnderlineOffset: 3 }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px',
      background: 'var(--ql-paper)',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--ql-ink-faint)',
            marginBottom: 14,
          }}>
            The Great Odyssey
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 300, color: 'var(--ql-ink)', margin: 0, letterSpacing: '-0.02em' }}>
            Create an account
          </h1>
          <div style={{ width: 32, height: 1, background: 'var(--ql-rule)', margin: '16px auto 0' }} />
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ql-ink-faint)',
              marginBottom: 8,
            }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="ql-input"
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ql-ink-faint)',
              marginBottom: 8,
            }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="ql-input"
            />
          </div>
          {error && (
            <p style={{ color: '#8b3a3a', fontSize: 13, margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'none',
              border: '1px solid var(--ql-ink)',
              padding: '12px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: loading ? 'var(--ql-ink-faint)' : 'var(--ql-ink)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ql-ink-faint)', marginTop: 24 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--ql-ink-soft)', textUnderlineOffset: 3 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
