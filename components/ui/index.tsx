'use client'

import React, { useRef, MouseEvent } from 'react'

// ─── GlowCard (base interactive card) ────────────────────────────────────────
interface GlowCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export function GlowCard({ children, className = '', style, onClick }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mouse-x', `${e.clientX - r.left}px`)
    el.style.setProperty('--mouse-y', `${e.clientY - r.top}px`)
  }

  const onMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--mouse-x', '-500px')
    el.style.setProperty('--mouse-y', '-500px')
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`glow-card ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: 'gold' | 'green' | 'red' | 'blue'
  live?: boolean
}

export function StatCard({ label, value, sub, accent = 'gold', live = false }: StatCardProps) {
  const accentColors = {
    gold: '#C9A84C',
    green: '#4CAF82',
    red: '#E05252',
    blue: '#5280E0',
  }
  const color = accentColors[accent]

  return (
    <GlowCard
      className="p-5 flex flex-col gap-2"
      style={{ borderLeft: `2px solid ${color}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          color: 'var(--text-muted)',
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
        {live && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="live-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#4CAF82', flexShrink: 0 }} />
            <span style={{ color: '#4CAF82', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em' }}>LIVE</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 400 }}>{sub}</div>
      )}
    </GlowCard>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────
interface PanelProps {
  title?: string
  badge?: string | number
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
  noPad?: boolean
}

export function Panel({ title, badge, children, className = '', action, noPad }: PanelProps) {
  return (
    <GlowCard className={`overflow-hidden ${className}`}>
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {title && (
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                {title}
              </span>
            )}
            {badge !== undefined && (
              <span style={{
                background: 'rgba(201,168,76,0.12)',
                color: '#C9A84C',
                fontSize: 11,
                fontWeight: 600,
                padding: '1px 8px',
                borderRadius: 20,
                border: '1px solid rgba(201,168,76,0.2)',
              }}>
                {badge}
              </span>
            )}
          </div>
          {action}
        </div>
      )}
      <div style={noPad ? {} : { padding: 20 }}>{children}</div>
    </GlowCard>
  )
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  NO_PUBLISHER: { label: 'No Publisher', bg: 'rgba(224,82,82,0.12)', color: '#E05252' },
  SELF_PUBLISHED: { label: 'Self-Published', bg: 'rgba(201,168,76,0.12)', color: '#C9A84C' },
  MAJOR: { label: 'Major', bg: 'rgba(82,128,224,0.12)', color: '#5280E0' },
  INDIE: { label: 'Indie', bg: 'rgba(82,128,224,0.1)', color: '#7BA4E8' },
  UNKNOWN: { label: 'Unknown', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
  PENDING: { label: 'Pending', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' },
  APPROVED: { label: 'Approved', bg: 'rgba(201,168,76,0.12)', color: '#C9A84C' },
  SENT: { label: 'Sent', bg: 'rgba(82,128,224,0.12)', color: '#5280E0' },
  OPENED: { label: 'Opened', bg: 'rgba(76,175,130,0.12)', color: '#4CAF82' },
  REPLIED: { label: 'Replied ★', bg: 'rgba(76,175,130,0.18)', color: '#4CAF82' },
  SKIPPED: { label: 'Skipped', bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' },
  SIGNED: { label: 'Signed ✓', bg: 'rgba(76,175,130,0.2)', color: '#4CAF82' },
  RUNNING: { label: 'Running', bg: 'rgba(201,168,76,0.12)', color: '#C9A84C' },
  COMPLETED: { label: 'Completed', bg: 'rgba(76,175,130,0.12)', color: '#4CAF82' },
  FAILED: { label: 'Failed', bg: 'rgba(224,82,82,0.12)', color: '#E05252' },
  QUEUED: { label: 'Queued', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
  HIGH: { label: 'High', bg: 'rgba(224,82,82,0.12)', color: '#E05252' },
  MEDIUM: { label: 'Medium', bg: 'rgba(201,168,76,0.12)', color: '#C9A84C' },
  LOW: { label: 'Low', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { label: status, bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 9px',
      borderRadius: 20,
      whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
    }}>
      {cfg.label}
    </span>
  )
}

// ─── ScoreBadge ───────────────────────────────────────────────────────────────
export function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
  const color = score >= 80 ? '#4CAF82' : score >= 60 ? '#C9A84C' : '#E05252'
  const bg = score >= 80 ? 'rgba(76,175,130,0.12)' : score >= 60 ? 'rgba(201,168,76,0.12)' : 'rgba(224,82,82,0.12)'
  return (
    <span style={{
      background: bg, color,
      fontSize: 12, fontWeight: 700,
      padding: '2px 9px', borderRadius: 7,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {score}
    </span>
  )
}

// ─── Streams ──────────────────────────────────────────────────────────────────
export function Streams({ value, className = '' }: { value: number | null; className?: string }) {
  if (!value) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
  const fmt = value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(1)}M`
    : value >= 1_000
    ? `${(value / 1_000).toFixed(0)}K`
    : value.toString()
  return <span className={className} style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{fmt}</span>
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ label, value, max = 100, color = '#C9A84C' }: {
  label: string; value: number; max?: number; color?: string
}) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{value}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── ActionBtn ────────────────────────────────────────────────────────────────
interface ActionBtnProps {
  children: React.ReactNode
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'gold' | 'green' | 'red' | 'ghost'
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}

export function ActionBtn({ children, onClick, variant = 'gold', size = 'md', disabled, className = '', type = 'button' }: ActionBtnProps) {
  const variants = {
    gold:  { bg: 'rgba(201,168,76,0.12)',  color: '#C9A84C', border: 'rgba(201,168,76,0.25)',  hover: 'rgba(201,168,76,0.22)' },
    green: { bg: 'rgba(76,175,130,0.12)',  color: '#4CAF82', border: 'rgba(76,175,130,0.25)',  hover: 'rgba(76,175,130,0.22)' },
    red:   { bg: 'rgba(224,82,82,0.12)',   color: '#E05252', border: 'rgba(224,82,82,0.25)',   hover: 'rgba(224,82,82,0.22)' },
    ghost: { bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.09)', hover: 'rgba(255,255,255,0.08)' },
  }
  const v = variants[variant]
  const pad = size === 'sm' ? '4px 12px' : '8px 18px'
  const fs = size === 'sm' ? 11 : 13

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        background: v.bg, color: v.color,
        border: `1px solid ${v.border}`,
        padding: pad, fontSize: fs,
        fontWeight: 600, borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '-0.01em',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = v.hover }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = v.bg }}
    >
      {children}
    </button>
  )
}

// ─── Royalties ────────────────────────────────────────────────────────────────
export function Royalties({ value }: { value: number | null }) {
  if (!value) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
  return (
    <span style={{ color: '#4CAF82', fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
      ${value.toLocaleString()}/mo
    </span>
  )
}
