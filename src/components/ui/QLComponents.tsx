'use client'

import React from 'react'

export function QLWordmark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 28 A 18 18 0 0 1 28 28"
        stroke="var(--ql-ink)"
        strokeWidth="1.2"
        fill="none"
      />
      <polygon
        points="16,4 17.2,14.8 22,8 15.2,15.2 28,16 15.2,16.8 22,24 17.2,17.2 16,28 14.8,17.2 10,24 16.8,16.8 4,16 16.8,15.2 10,8 14.8,14.8"
        fill="var(--ql-ink)"
        opacity="0.85"
      />
      <circle cx="16" cy="16" r="1.5" fill="var(--ql-paper)" />
    </svg>
  )
}

type SealId = 'L1' | 'L2' | 'L3'

export function QLSeal({ id, size = 48, color }: { id: SealId; size?: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="0.5" fill="none" opacity="0.4" />

      {id === 'L1' && (
        <>
          <line x1="24" y1="8" x2="24" y2="40" stroke={color} strokeWidth="0.8" opacity="0.7" />
          <line x1="8" y1="24" x2="40" y2="24" stroke={color} strokeWidth="0.8" opacity="0.7" />
          <line x1="12.7" y1="12.7" x2="35.3" y2="35.3" stroke={color} strokeWidth="0.5" opacity="0.4" />
          <line x1="35.3" y1="12.7" x2="12.7" y2="35.3" stroke={color} strokeWidth="0.5" opacity="0.4" />
          <polygon points="24,8 25.5,22 24,26 22.5,22" fill={color} opacity="0.8" />
          <polygon points="24,40 22.5,26 24,22 25.5,26" fill={color} opacity="0.4" />
          <circle cx="24" cy="24" r="2" fill={color} opacity="0.8" />
        </>
      )}

      {id === 'L2' && (
        <>
          <rect x="16" y="12" width="16" height="24" stroke={color} strokeWidth="0.8" fill="none" opacity="0.7" />
          <line x1="16" y1="18" x2="32" y2="18" stroke={color} strokeWidth="0.5" opacity="0.4" />
          <line x1="16" y1="22" x2="32" y2="22" stroke={color} strokeWidth="0.5" opacity="0.4" />
          <line x1="16" y1="26" x2="32" y2="26" stroke={color} strokeWidth="0.5" opacity="0.4" />
          <line x1="16" y1="30" x2="32" y2="30" stroke={color} strokeWidth="0.5" opacity="0.4" />
          <line x1="19" y1="12" x2="19" y2="36" stroke={color} strokeWidth="1.2" opacity="0.6" />
        </>
      )}

      {id === 'L3' && (
        <>
          <line x1="24" y1="10" x2="24" y2="34" stroke={color} strokeWidth="1" opacity="0.7" />
          <line x1="16" y1="18" x2="32" y2="18" stroke={color} strokeWidth="0.8" opacity="0.6" />
          <path d="M16 34 Q20 38 24 34 Q28 38 32 34" stroke={color} strokeWidth="0.8" fill="none" opacity="0.6" />
          <circle cx="24" cy="12" r="2.5" stroke={color} strokeWidth="0.8" fill="none" opacity="0.7" />
          <path d="M16 30 Q18 32 16 34" stroke={color} strokeWidth="0.6" fill="none" opacity="0.4" />
          <path d="M32 30 Q30 32 32 34" stroke={color} strokeWidth="0.6" fill="none" opacity="0.4" />
        </>
      )}
    </svg>
  )
}

export function QLOrnament({ width = 120 }: { width?: number }) {
  return (
    <svg
      width={width}
      height={12}
      viewBox="0 0 120 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line x1="0" y1="6" x2="48" y2="6" stroke="var(--ql-rule)" strokeWidth="0.8" />
      <path d="M52 6 Q56 2 60 6 Q64 10 68 6" stroke="var(--ql-ink-faint)" strokeWidth="0.8" fill="none" />
      <line x1="72" y1="6" x2="120" y2="6" stroke="var(--ql-rule)" strokeWidth="0.8" />
      <circle cx="60" cy="6" r="1" fill="var(--ql-ink-faint)" />
    </svg>
  )
}

export function QLDropCap({ letter }: { letter: string }) {
  return (
    <span style={{
      float: 'left',
      fontSize: 52,
      lineHeight: '0.85',
      fontFamily: "'Caveat', cursive",
      color: 'var(--ql-ink)',
      marginRight: 6,
      marginTop: 4,
      opacity: 0.9,
    }}>
      {letter}
    </span>
  )
}

export function QLTicks({ value, color = 'var(--ql-ink)' }: { value: number; color?: string }) {
  const ticks = 11
  const pct = Math.round(value / 10)
  return (
    <svg width="100%" height="20" viewBox="0 0 220 20" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: ticks }).map((_, i) => {
        const x = (i / (ticks - 1)) * 220
        const filled = i <= pct
        const major = i === 0 || i === 5 || i === 10
        return (
          <line
            key={i}
            x1={x}
            y1={major ? 4 : 7}
            x2={x}
            y2={major ? 16 : 13}
            stroke={filled ? color : 'var(--ql-rule)'}
            strokeWidth={major ? 1.5 : 0.8}
          />
        )
      })}
    </svg>
  )
}

export function QLMarginQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote style={{
      borderLeft: '2px solid var(--ql-rule)',
      paddingLeft: 12,
      margin: '12px 0',
      fontStyle: 'italic',
      fontSize: 13,
      color: 'var(--ql-ink-soft)',
      fontFamily: "'Inter', sans-serif",
    }}>
      {children}
    </blockquote>
  )
}

export function QLPageFoot({ folio }: { folio?: string }) {
  return (
    <div style={{ borderTop: '1px solid var(--ql-rule)', paddingTop: 8, marginTop: 24 }}>
      {folio && (
        <span style={{
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ql-ink-faint)',
          fontFamily: "'Inter', sans-serif",
        }}>
          {folio}
        </span>
      )}
    </div>
  )
}

export function QLPaperTexture() {
  return (
    <svg
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.025,
      }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <filter id="paper-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-noise)" />
    </svg>
  )
}
