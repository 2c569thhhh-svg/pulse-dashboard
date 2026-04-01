'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type NavItem = {
  href: string
  label: string
  badge?: string
  badgeColor?: string
  icon: React.ReactNode
}

const navMain: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Command Center',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/scan',
    label: 'Scan Engine',
    badge: 'NEW',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    href: '/producers',
    label: 'Leads',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/outreach',
    label: 'Outreach',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: '/opportunities',
    label: 'Opportunities',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: '/monitoring',
    label: 'Monitor',
    badge: '5',
    badgeColor: '#f16060',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
]

const navBottom: NavItem[] = [
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const navLink = (item: NavItem) => {
    const active = isActive(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: collapsed ? '7px 0' : '7px 10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: active ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)',
          background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
          borderRadius: 7,
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          letterSpacing: '-0.01em',
          transition: 'background 0.12s ease, color 0.12s ease',
          marginBottom: 1,
          position: 'relative',
        }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }
        }}
      >
        {/* Active indicator */}
        {active && (
          <span style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 2,
            height: 14,
            borderRadius: 99,
            background: 'var(--gold)',
          }} />
        )}
        <span style={{
          flexShrink: 0,
          color: active ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
          display: 'flex',
        }}>
          {item.icon}
        </span>
        {!collapsed && (
          <span style={{ flex: 1 }}>{item.label}</span>
        )}
        {!collapsed && item.badge && (
          <span style={{
            fontSize: 9,
            fontWeight: 800,
            background: item.badgeColor ? `${item.badgeColor}22` : 'rgba(201,168,76,0.15)',
            color: item.badgeColor ?? 'var(--gold)',
            padding: '1.5px 6px',
            borderRadius: 99,
            letterSpacing: '0.04em',
            border: `1px solid ${item.badgeColor ? `${item.badgeColor}44` : 'rgba(201,168,76,0.25)'}`,
            minWidth: 18,
            textAlign: 'center',
          }}>
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside style={{
      width: collapsed ? 56 : 216,
      minHeight: '100vh',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(9,9,15,0.97)',
      borderRight: '1px solid var(--border)',
      backdropFilter: 'blur(20px)',
      transition: 'width 0.18s cubic-bezier(0.4,0,0.2,1)',
      zIndex: 50,
      overflow: 'hidden',
    }}>

      {/* ── Logo ─────────────────────────── */}
      <div style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0 14px' : '0 14px 0 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            {/* Logomark */}
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: 'linear-gradient(140deg, rgba(201,168,76,0.28) 0%, rgba(201,168,76,0.06) 100%)',
              border: '1px solid rgba(201,168,76,0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.93)', lineHeight: 1.2 }}>
                Pulse
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-disabled)', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Publishing Intel
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'linear-gradient(140deg, rgba(201,168,76,0.28) 0%, rgba(201,168,76,0.06) 100%)',
            border: '1px solid rgba(201,168,76,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
        )}

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-disabled)', padding: '4px',
              borderRadius: 5, display: 'flex', alignItems: 'center',
              transition: 'color 0.12s, background 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-disabled)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            style={{
              position: 'absolute',
              bottom: -1,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-disabled)', padding: '4px 6px',
              borderRadius: 5, display: 'flex', alignItems: 'center',
              transition: 'color 0.12s, background 0.12s',
            }}
          />
        )}
      </div>

      {/* ── Pipeline status ───────────────── */}
      {!collapsed && (
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div className="live-dot" style={{
              width: 5, height: 5,
              background: 'var(--green)',
              borderRadius: '50%',
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--green)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Pipeline Active
            </span>
          </div>
        </div>
      )}

      {/* ── Navigation ───────────────────── */}
      <nav style={{ flex: 1, padding: collapsed ? '10px 8px' : '10px 8px', overflowY: 'auto' }}>
        {navMain.map(item => navLink(item))}
      </nav>

      {/* ── Bottom nav ───────────────────── */}
      <div style={{ padding: collapsed ? '8px' : '8px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        {navBottom.map(item => navLink(item))}

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '7px 0', marginTop: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-disabled)', borderRadius: 7,
              transition: 'color 0.12s, background 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-disabled)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Footer ───────────────────────── */}
      {!collapsed && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Reyes Music × Raleigh MG
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-disabled)', marginTop: 1 }}>
            Miami, FL
          </div>
        </div>
      )}
    </aside>
  )
}
