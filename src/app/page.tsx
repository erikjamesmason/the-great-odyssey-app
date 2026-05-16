import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { QLWordmark, QLPaperTexture, QLOrnament, QLPageFoot } from '@/components/ui/QLComponents'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--ql-paper)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <QLPaperTexture />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <QLWordmark size={48} />
        </div>

        <h1 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ql-ink)',
          marginBottom: 8,
          margin: '0 0 8px',
        }}>
          The Great Odyssey
        </h1>

        <QLOrnament width={160} />

        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 22,
          color: 'var(--ql-ink-soft)',
          margin: '20px 0 40px',
          lineHeight: 1.4,
        }}>
          Three lives, five years, one honest look.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link
            href="/signup"
            style={{
              display: 'inline-block',
              padding: '10px 32px',
              background: 'var(--ql-ink)',
              color: 'var(--ql-paper)',
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.05em',
              textDecoration: 'none',
              border: '1px solid var(--ql-ink)',
            }}
          >
            Begin →
          </Link>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '10px 32px',
              background: 'none',
              color: 'var(--ql-ink-soft)',
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              textDecoration: 'none',
              border: '1px solid var(--ql-rule)',
            }}
          >
            I&rsquo;ve been here before
          </Link>
        </div>

        <div style={{ marginTop: 40 }}>
          <QLPageFoot folio="Est. 2026" />
        </div>
      </div>
    </div>
  )
}
