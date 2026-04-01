'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { mockAlerts, mockWatchedProducers } from '@/lib/mock-data'
import type { MonitoringAlert, WatchedProducer, AlertType } from '@/lib/mock-data'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ms: number): string {
  const diff = Date.now() - ms
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

function fmtStreams(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

const ALERT_META: Record<AlertType, { icon: string; label: string; color: string; bg: string; border: string; animClass?: string }> = {
  COMPETITOR: {
    icon: '⚔️',
    label: 'Competitor',
    color: '#f16060',
    bg: 'rgba(241,96,96,0.07)',
    border: 'rgba(241,96,96,0.55)',
    animClass: 'alert-competitor',
  },
  TRENDING:   {
    icon: '🔥',
    label: 'Trending',
    color: '#E08B52',
    bg: 'rgba(224,139,82,0.07)',
    border: 'rgba(224,139,82,0.5)',
    animClass: 'alert-trending',
  },
  PLACEMENT:  {
    icon: '🎯',
    label: 'Placement',
    color: '#3ecf8e',
    bg: 'rgba(62,207,142,0.07)',
    border: 'rgba(62,207,142,0.45)',
  },
  VIRAL:      {
    icon: '⚡',
    label: 'Viral',
    color: '#9b7ef8',
    bg: 'rgba(155,126,248,0.07)',
    border: 'rgba(155,126,248,0.5)',
    animClass: 'alert-viral',
  },
  MILESTONE:  {
    icon: '🏆',
    label: 'Milestone',
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.07)',
    border: 'rgba(201,168,76,0.45)',
  },
  NEW_RELEASE:{
    icon: '🎵',
    label: 'New Release',
    color: '#5b8def',
    bg: 'rgba(91,141,239,0.07)',
    border: 'rgba(91,141,239,0.45)',
  },
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 56, h = 24, pad = 2
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {/* Last point dot */}
      {data.length > 0 && (() => {
        const last = data[data.length - 1]
        const x = w - pad
        const y = h - pad - ((last - min) / range) * (h - pad * 2)
        return <circle cx={x} cy={y} r="2.5" fill={color} />
      })()}
    </svg>
  )
}

// ─── Alert Card ───────────────────────────────────────────────────────────────
function AlertCard({
  alert,
  onDismiss,
  onView,
  style,
}: {
  alert: MonitoringAlert
  onDismiss: (id: string) => void
  onView: (id: string) => void
  style?: React.CSSProperties
}) {
  const meta = ALERT_META[alert.type]
  const isNew = !alert.read

  return (
    <div
      className={`alert-slide-in ${meta.animClass ?? ''}`}
      style={{
        display: 'flex',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 10,
        background: isNew ? meta.bg : 'rgba(255,255,255,0.024)',
        border: `1px solid ${isNew ? meta.border : 'rgba(255,255,255,0.06)'}`,
        borderLeft: `3px solid ${meta.border}`,
        marginBottom: 8,
        cursor: 'default',
        transition: 'background 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: `linear-gradient(135deg, ${meta.bg}, rgba(0,0,0,0.2))`,
        border: `1px solid ${meta.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17, marginTop: 1,
      }}>
        {meta.icon}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
            {alert.title}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
            background: `${meta.bg}`, color: meta.color,
            border: `1px solid ${meta.border}`, letterSpacing: '0.04em',
          }}>
            {meta.label.toUpperCase()}
          </span>
          {isNew && (
            <span className="new-badge" style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
              background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.18)', letterSpacing: '0.06em',
            }}>
              NEW
            </span>
          )}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
          <span style={{ color: meta.color, fontWeight: 600 }}>{alert.producerName}</span>
          {' — '}
          {alert.description}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Context pills */}
          {alert.artist && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '1px 7px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)' }}>
              {alert.artist}
            </span>
          )}
          {alert.streamDelta && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#3ecf8e' }}>
              ↑ {alert.streamDelta}
            </span>
          )}
          {alert.competitor && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#f16060' }}>
              ⚔️ {alert.competitor}
            </span>
          )}
          {alert.chartPosition && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#C9A84C' }}>
              📊 {alert.chartPosition}
            </span>
          )}
          {alert.placementCount && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#3ecf8e' }}>
              🎯 {alert.placementCount} placement{alert.placementCount > 1 ? 's' : ''}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {timeAgo(alert.timestampMs)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
        {isNew && (
          <span className="alert-dot" style={{
            width: 8, height: 8, borderRadius: '50%',
            background: meta.color, flexShrink: 0,
          }} />
        )}
        <button
          onClick={() => onView(alert.producerId)}
          style={{
            fontSize: 11, fontWeight: 600, padding: '4px 10px',
            borderRadius: 6, border: `1px solid ${meta.border}`,
            background: meta.bg, color: meta.color, cursor: 'pointer',
            whiteSpace: 'nowrap', transition: 'opacity 0.15s',
          }}
        >
          View Lead
        </button>
        <button
          onClick={() => onDismiss(alert.id)}
          style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'transparent', color: 'var(--text-muted)',
            cursor: 'pointer', transition: 'color 0.15s',
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

// ─── Watched Producer Card ────────────────────────────────────────────────────
function WatchedCard({ producer, onUnwatch }: { producer: WatchedProducer; onUnwatch: (id: string) => void }) {
  const trendColor = producer.trendDirection === 'up' ? '#3ecf8e' : producer.trendDirection === 'down' ? '#f16060' : 'var(--text-muted)'
  const trendArrow = producer.trendDirection === 'up' ? '↑' : producer.trendDirection === 'down' ? '↓' : '→'

  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${producer.signed ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.07)'}`,
      marginBottom: 8,
      transition: 'background 0.15s, border-color 0.15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.048)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
    >
      {/* Row 1: Name + badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{producer.name}</span>

        {producer.signed && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 20, background: 'rgba(201,168,76,0.14)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.28)' }}>
            ✓ SIGNED
          </span>
        )}
        {producer.isFirstToWatch && !producer.signed && (
          <span className="badge-exclusive">★ FIRST TO WATCH</span>
        )}
        {producer.alertsThisWeek > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(241,96,96,0.1)', color: '#f16060', border: '1px solid rgba(241,96,96,0.2)' }}>
            {producer.alertsThisWeek} alert{producer.alertsThisWeek > 1 ? 's' : ''} this week
          </span>
        )}

        {/* Unwatch button */}
        <button
          onClick={() => onUnwatch(producer.id)}
          style={{
            marginLeft: 'auto', fontSize: 11, padding: '3px 10px', borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.09)', background: 'transparent',
            color: 'var(--text-muted)', cursor: 'pointer',
          }}
        >
          Unwatch
        </button>
      </div>

      {/* Row 2: Stats + sparkline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {fmtStreams(producer.monthlyStreams)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>mo. streams</div>
        </div>

        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: trendColor }}>
            {trendArrow} {producer.trendPct}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>7-day trend</div>
        </div>

        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#3ecf8e' }}>
            {producer.placementsThisMonth}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>placements</div>
        </div>

        {producer.streakLabel && (
          <div className="streak-fire" style={{ fontSize: 12, fontWeight: 700, color: '#E08B52', marginLeft: 4 }}>
            🔥 {producer.streakLabel}
          </div>
        )}

        <div style={{ marginLeft: 'auto' }}>
          <Sparkline data={producer.streamTrend} color={trendColor} />
        </div>
      </div>

      {/* Row 3: Artists + last activity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {producer.artists.slice(0, 3).map(a => (
          <span key={a} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '1px 7px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)' }}>
            {a}
          </span>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Last activity {producer.lastActivity} · Watching {producer.watchedSince}
        </span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MonitoringPage() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [watched, setWatched] = useState(mockWatchedProducers)
  const [filter, setFilter] = useState<AlertType | 'ALL'>('ALL')
  const [showRead, setShowRead] = useState(false)
  const [tick, setTick] = useState(0)

  // Re-render every 30s so "time ago" labels update
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  // Dismiss an alert
  function dismissAlert(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  // Mark alert as read on view
  function viewAlert(producerId: string) {
    setAlerts(prev => prev.map(a =>
      a.producerId === producerId ? { ...a, read: true } : a
    ))
  }

  // Unwatch producer
  function unwatchProducer(id: string) {
    setWatched(prev => prev.filter(p => p.id !== id))
  }

  // Mark all read
  function markAllRead() {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
  }

  // Filtered + sorted alerts
  const filtered = alerts
    .filter(a => filter === 'ALL' || a.type === filter)
    .filter(a => showRead || !a.read)
    .sort((a, b) => {
      // Unread first, then by recency
      if (a.read !== b.read) return a.read ? 1 : -1
      return b.timestampMs - a.timestampMs
    })

  const unreadCount = alerts.filter(a => !a.read).length
  const criticalCount = alerts.filter(a => a.urgency === 'critical' && !a.read).length
  const totalStreams = watched.reduce((s, p) => s + p.monthlyStreams, 0)
  const totalPlacements = watched.reduce((s, p) => s + p.placementsThisMonth, 0)

  const FILTER_TABS: Array<{ key: AlertType | 'ALL'; label: string; icon: string }> = [
    { key: 'ALL',         label: 'All',       icon: '📡' },
    { key: 'COMPETITOR',  label: 'Competitor', icon: '⚔️' },
    { key: 'TRENDING',    label: 'Trending',   icon: '🔥' },
    { key: 'PLACEMENT',   label: 'Placement',  icon: '🎯' },
    { key: 'VIRAL',       label: 'Viral',      icon: '⚡' },
    { key: 'MILESTONE',   label: 'Milestone',  icon: '🏆' },
  ]

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>
                Catalog Monitor
              </h1>
              {unreadCount > 0 && (
                <span className="badge-pop" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 22, height: 22, borderRadius: 99,
                  background: criticalCount > 0 ? '#f16060' : '#E08B52',
                  color: '#fff', fontSize: 11, fontWeight: 800,
                  padding: '0 6px',
                }}>
                  {unreadCount}
                </span>
              )}
              {criticalCount > 0 && (
                <span className="alert-dot" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 700, color: '#f16060',
                  padding: '3px 10px', borderRadius: 20,
                  background: 'rgba(241,96,96,0.1)', border: '1px solid rgba(241,96,96,0.25)',
                }}>
                  🚨 {criticalCount} Critical
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Real-time alerts when your watched producers trend, place, or get approached by competitors.
            </p>
          </div>
          <button
            onClick={markAllRead}
            style={{
              fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            Mark all read
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Watching',       value: watched.length,                    unit: 'producers',   color: '#5b8def',  icon: '👁️' },
            { label: 'Unread Alerts',  value: unreadCount,                       unit: 'new',         color: unreadCount > 0 ? '#f16060' : 'var(--text-muted)', icon: '🔔' },
            { label: 'Monthly Streams',value: fmtStreams(totalStreams),           unit: 'combined',    color: '#3ecf8e',  icon: '📊' },
            { label: 'Placements',     value: totalPlacements,                   unit: 'this month',  color: '#C9A84C',  icon: '🎯' },
          ].map(stat => (
            <div key={stat.label} className="stat-pill" style={{
              padding: '14px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>{stat.icon}</span> {stat.label}
              </div>
              <div className="count-up" style={{ fontSize: 24, fontWeight: 800, color: stat.color, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{stat.unit}</div>
            </div>
          ))}
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

          {/* ── Left: Alert Feed ── */}
          <div>
            {/* Filter tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {FILTER_TABS.map(tab => {
                const count = tab.key === 'ALL'
                  ? alerts.filter(a => !a.read).length
                  : alerts.filter(a => a.type === tab.key && !a.read).length
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    style={{
                      fontSize: 12, fontWeight: filter === tab.key ? 700 : 500,
                      padding: '5px 12px', borderRadius: 20,
                      border: `1px solid ${filter === tab.key ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      background: filter === tab.key ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                      color: filter === tab.key ? '#C9A84C' : 'var(--text-secondary)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'all 0.15s',
                    }}
                  >
                    {tab.icon} {tab.label}
                    {count > 0 && (
                      <span style={{
                        minWidth: 16, height: 16, borderRadius: 99, fontSize: 10, fontWeight: 800,
                        background: ALERT_META[tab.key as AlertType]?.color ?? '#f16060',
                        color: '#fff', display: 'inline-flex', alignItems: 'center',
                        justifyContent: 'center', padding: '0 4px',
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}

              <button
                onClick={() => setShowRead(s => !s)}
                style={{
                  marginLeft: 'auto', fontSize: 12, padding: '5px 12px', borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                  color: showRead ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {showRead ? '✓ Showing all' : 'Show read'}
              </button>
            </div>

            {/* Alert cards */}
            {filtered.length === 0 ? (
              <div style={{
                padding: '40px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.02)', textAlign: 'center',
                color: 'var(--text-muted)', fontSize: 13,
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                {showRead ? 'No alerts for this filter.' : 'You\'re all caught up — no unread alerts.'}
                {!showRead && (
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => setShowRead(true)} style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Show read alerts
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Section: Unread */}
                {filtered.some(a => !a.read) && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>
                      UNREAD
                    </div>
                    {filtered.filter(a => !a.read).map(alert => (
                      <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} onView={viewAlert} />
                    ))}
                  </>
                )}

                {/* Section: Read (only when showRead) */}
                {showRead && filtered.some(a => a.read) && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', margin: '16px 0 8px' }}>
                      EARLIER
                    </div>
                    {filtered.filter(a => a.read).map(alert => (
                      <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} onView={viewAlert} />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Watched Producers ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Watched Producers
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {watched.length} active
              </span>
            </div>

            {watched.length === 0 ? (
              <div style={{
                padding: '32px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.02)', textAlign: 'center',
                color: 'var(--text-muted)', fontSize: 13,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>👁️</div>
                No producers being watched.
                <br />
                <span style={{ fontSize: 11 }}>Add producers from the Leads page.</span>
              </div>
            ) : (
              watched.map(p => (
                <WatchedCard key={p.id} producer={p} onUnwatch={unwatchProducer} />
              ))
            )}

            {/* Upsell: upgrade note */}
            <div style={{
              marginTop: 16, padding: '14px 16px', borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(201,168,76,0.07), rgba(91,141,239,0.05))',
              border: '1px solid rgba(201,168,76,0.2)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C', marginBottom: 4 }}>
                💡 Retention Value
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                You're monitoring <strong style={{ color: 'var(--text-primary)' }}>{fmtStreams(totalStreams)}</strong> in monthly streams.
                At standard royalty rates, that's an estimated <strong style={{ color: '#3ecf8e' }}>
                  ${Math.round(totalStreams * 0.004 / 12).toLocaleString()}/mo
                </strong> in uncollected performance royalties.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
