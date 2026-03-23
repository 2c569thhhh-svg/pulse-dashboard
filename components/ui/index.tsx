'use client'

import React from 'react'

// ─── StatCard ───────────────────────────────────────────────────────────────
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
    <div
      className="glass-card p-5 flex flex-col gap-2"
      style={{ borderLeft: `2px solid ${color}` }}
    >
      <div className="flex items-center justify-between">
        <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </span>
        {live && (
          <div className="flex items-center gap-1.5">
            <div
              className="live-dot rounded-full"
              style={{ width: 6, height: 6, background: '#4CAF82' }}
            />
            <span style={{ color: '#4CAF82', fontSize: 10, fontWeight: 600 }}>LIVE</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub}</div>
      )}
    </div>
  )
}

// ─── Panel ──────────────────────────────────────────────────────────────────
interface PanelProps {
  title?: string
  badge?: string | number
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function Panel({ title, badge, children, className = '', action }: PanelProps) {
  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      {(title || action) && (
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            {title && (
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                {title}
              </span>
            )}
            {badge !== undefined && (
              <span
                style={{
                  background: 'rgba(201,168,76,0.15)',
                  color: '#C9A84C',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 20,
                  border: '1px solid rgba(201,168,76,0.25)',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── StatusBadge ────────────────────────────────────────────────────────────
interface StatusBadgeProps {
  status: string
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  NO_PUBLISHER: { label: 'No Publisher', bg: 'rgba(224,82,82,0.15)', color: '#E05252' },
  SELF_PUBLISHED: { label: 'Self-Published', bg: 'rgba(201,168,76,0.15)', color: '#C9A84C' },
  MAJOR: { label: 'Major', bg: 'rgba(82,128,224,0.15)', color: '#5280E0' },
  INDIE: { label: 'Indie', bg: 'rgba(82,128,224,0.1)', color: '#7BA4E8' },
  UNKNOWN: { label: 'Unknown', bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' },
  PENDING: { label: 'Pending', bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' },
  APPROVED: { label: 'Approved', bg: 'rgba(201,168,76,0.15)', color: '#C9A84C' },
  SENT: { label: 'Sent', bg: 'rgba(82,128,224,0.15)', color: '#5280E0' },
  OPENED: { label: 'Opened', bg: 'rgba(76,175,130,0.15)', color: '#4CAF82' },
  REPLIED: { label: 'Replied ★', bg: 'rgba(76,175,130,0.2)', color: '#4CAF82' },
  SKIPPED: { label: 'Skipped', bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' },
  SIGNED: { label: 'Signed ✓', bg: 'rgba(76,175,130,0.25)', color: '#4CAF82' },
  RUNNING: { label: 'Running', bg: 'rgba(201,168,76,0.15)', color: '#C9A84C' },
  COMPLETED: { label: 'Completed', bg: 'rgba(76,175,130,0.15)', color: '#4CAF82' },
  FAILED: { label: 'Failed', bg: 'rgba(224,82,82,0.15)', color: '#E05252' },
  QUEUED: { label: 'Queued', bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' },
  HIGH: { label: 'High', bg: 'rgba(224,82,82,0.15)', color: '#E05252' },
  MEDIUM: { label: 'Medium', bg: 'rgba(201,168,76,0.15)', color: '#C9A84C' },
  LOW: { label: 'Low', bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }
  return (
    <span
      style={{
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 9px',
        borderRadius: 20,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  )
}

// ─── ScoreBadge ─────────────────────────────────────────────────────────────
interface ScoreBadgeProps {
  score: number | null
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  if (score === null) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>

  const color = score >= 80 ? '#4CAF82' : score >= 60 ? '#C9A84C' : '#E05252'
  const bg = score >= 80 ? 'rgba(76,175,130,0.15)' : score >= 60 ? 'rgba(201,168,76,0.15)' : 'rgba(224,82,82,0.15)'

  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: 13,
        fontWeight: 800,
        padding: '3px 10px',
        borderRadius: 8,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {score}
    </span>
  )
}

// ─── Streams ────────────────────────────────────────────────────────────────
interface StreamsProps {
  value: number | null
  className?: string
}

export function Streams({ value, className = '' }: StreamsProps) {
  if (!value) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>

  let formatted: string
  if (value >= 1_000_000) {
    formatted = `${(value / 1_000_000).toFixed(1)}M`
  } else if (value >= 1_000) {
    formatted = `${(value / 1_000).toFixed(0)}K`
  } else {
    formatted = value.toString()
  }

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatted}
    </span>
  )
}

// ─── ProgressBar ────────────────────────────────────────────────────────────
interface ProgressBarProps {
  label: string
  value: number
  max?: number
  color?: string
}

export function ProgressBar({ label, value, max = 100, color = '#C9A84C' }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{value}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  )
}

// ─── ActionBtn ──────────────────────────────────────────────────────────────
interface ActionBtnProps {
  children: React.ReactNode
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'gold' | 'green' | 'red' | 'ghost'
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
}

export function ActionBtn({ children, onClick, variant = 'gold', size = 'md', disabled, className = '' }: ActionBtnProps) {
  const variants = {
    gold: { bg: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: 'rgba(201,168,76,0.3)', hoverBg: 'rgba(201,168,76,0.25)' },
    green: { bg: 'rgba(76,175,130,0.15)', color: '#4CAF82', border: 'rgba(76,175,130,0.3)', hoverBg: 'rgba(76,175,130,0.25)' },
    red: { bg: 'rgba(224,82,82,0.15)', color: '#E05252', border: 'rgba(224,82,82,0.3)', hoverBg: 'rgba(224,82,82,0.25)' },
    ghost: { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.1)', hoverBg: 'rgba(255,255,255,0.1)' },
  }
  const v = variants[variant]
  const padding = size === 'sm' ? '4px 12px' : '8px 18px'
  const fontSize = size === 'sm' ? 11 : 13

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        padding,
        fontSize,
        fontWeight: 700,
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'Syne, sans-serif',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => { if (!disabled) (e.target as HTMLButtonElement).style.background = v.hoverBg }}
      onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = v.bg }}
    >
      {children}
    </button>
  )
}

// ─── Royalties ───────────────────────────────────────────────────────────────
export function Royalties({ value }: { value: number | null }) {
  if (!value) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
  return (
    <span style={{ color: '#4CAF82', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
      ${value.toLocaleString()}/mo
    </span>
  )
}
