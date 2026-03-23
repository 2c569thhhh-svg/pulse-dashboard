'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  {
    href: '/dashboard',
    label: 'Command Center',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/scan',
    label: 'Scan Engine',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
    badge: 'NEW',
  },
  {
    href: '/producers',
    label: 'Leads',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: '/opportunities',
    label: 'Opportunities',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside style={{
      width: collapsed ? 60 : 216,
      minHeight: '100vh',
      background: 'rgba(8,8,16,0.98)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      backdropFilter: 'blur(20px)',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 8,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Logo mark */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.08))',
              border: '1px solid rgba(201,168,76,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.92)' }}>
                Pulse
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.06em', marginTop: 0, textTransform: 'uppercase' }}>
                Publishing Intel
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.08))',
            border: '1px solid rgba(201,168,76,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Live indicator */}
      {!collapsed && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div className="live-dot" style={{ width: 5, height: 5, background: '#4CAF82', borderRadius: '50%', flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#4CAF82', letterSpacing: '0.06em' }}>
              PIPELINE ACTIVE
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 8px' }}>
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '9px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: isActive ? '#C9A84C' : 'var(--text-secondary)',
                background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderRadius: 8,
                borderLeft: isActive ? '2px solid rgba(201,168,76,0.6)' : '2px solid transparent',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
                marginBottom: 2,
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{ flex: 1 }}>{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  background: 'rgba(201,168,76,0.2)',
                  color: '#C9A84C',
                  padding: '1px 6px',
                  borderRadius: 20,
                  letterSpacing: '0.04em',
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 400 }}>
            Reyes Music × Raleigh MG
            <br />
            <span style={{ color: 'rgba(255,255,255,0.16)', fontSize: 10 }}>Miami, FL</span>
          </div>
        </div>
      )}
    </aside>
  )
}
