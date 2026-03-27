'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IridescentOrb } from '@/components/ui/IridescentOrb'
import type { NewRelease, ReleaseWriter } from '@/app/api/new-releases/route'

// ── Flat list of every unaffiliated writer across all releases ────────────────
interface Lead extends ReleaseWriter {
  track: string
  artist: string
  albumArt: string
  releaseDate: string
}

// ── Orbiting writer name tag ──────────────────────────────────────────────────
function OrbitTag({ name, radius, duration, delay }: {
  name: string
  radius: number
  duration: number
  delay: number
}) {
  return (
    <div
      className="orbit-arm"
      style={{ animationDuration: `${duration}s`, animationDelay: `-${delay}s` }}
    >
      <div
        className="orbit-tag"
        style={{ left: radius, animationDuration: `${duration}s`, animationDelay: `-${delay}s` }}
      >
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 12px',
          borderRadius: 99,
          background: 'rgba(130, 60, 255, 0.12)',
          border: '1px solid rgba(155, 126, 248, 0.22)',
          backdropFilter: 'blur(10px)',
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(200, 160, 255, 0.92)',
          letterSpacing: '0.01em',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(200,140,255,0.7)', flexShrink: 0, display: 'inline-block' }} />
          {name}
        </span>
      </div>
    </div>
  )
}

// ── Writer lead card ──────────────────────────────────────────────────────────
function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(155, 126, 248, 0.25)'
        el.style.background = 'rgba(130, 60, 255, 0.06)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(255,255,255,0.07)'
        el.style.background = 'rgba(255,255,255,0.03)'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Album art banner */}
      <div style={{ height: 56, background: 'rgba(130,60,255,0.08)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {lead.albumArt ? (
          <img
            src={lead.albumArt}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, filter: 'blur(6px) saturate(1.4)', transform: 'scale(1.1)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(130,60,255,0.15), rgba(78,205,196,0.08))' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,9,15,0.7) 0%, transparent 100%)' }} />
        {/* Small album art */}
        {lead.albumArt && (
          <img
            src={lead.albumArt}
            alt=""
            style={{ position: 'absolute', bottom: 8, left: 14, width: 32, height: 32, borderRadius: 5, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.12)' }}
          />
        )}
        {/* NO PUBLISHER badge */}
        <span style={{
          position: 'absolute', top: 8, right: 10,
          fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
          padding: '2px 8px', borderRadius: 99,
          background: 'rgba(224, 82, 82, 0.18)', color: '#f16060',
          border: '1px solid rgba(224,82,82,0.25)',
        }}>
          NO PUBLISHER
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Writer name */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.02em', marginBottom: 3 }}>
            {lead.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.track} — {lead.artist}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {lead.pro && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 5,
              background: 'rgba(82,128,224,0.1)', color: '#5b8def',
              border: '1px solid rgba(82,128,224,0.18)', letterSpacing: '0.04em',
            }}>
              {lead.pro}
            </span>
          )}
          {lead.estimatedMonthly && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 5,
              background: 'rgba(62,207,142,0.1)', color: 'var(--green)',
              border: '1px solid rgba(62,207,142,0.18)',
            }}>
              ~${lead.estimatedMonthly.toLocaleString()}/mo uncollected
            </span>
          )}
        </div>

        {/* Release date */}
        <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 'auto' }}>
          Released {new Date(lead.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>

        {/* CTA */}
        <Link
          href="/producers"
          style={{
            display: 'block', textAlign: 'center',
            padding: '7px 0', borderRadius: 8, marginTop: 2,
            background: 'rgba(130, 60, 255, 0.1)',
            border: '1px solid rgba(155, 126, 248, 0.2)',
            color: 'rgba(200, 160, 255, 0.9)',
            fontSize: 12, fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(130,60,255,0.2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(130,60,255,0.1)' }}
        >
          Add to Pipeline →
        </Link>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [releases, setReleases] = useState<NewRelease[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'spotify' | 'demo'>('demo')

  useEffect(() => {
    fetch('/api/new-releases')
      .then(r => r.json())
      .then(data => {
        const rels: NewRelease[] = data.releases || []
        setReleases(rels)
        setSource(data.source || 'demo')

        // Flatten to unique unaffiliated writers
        const seen = new Set<string>()
        const flat: Lead[] = []
        for (const rel of rels) {
          for (const w of rel.writers) {
            if (!w.hasPublisher) {
              const key = `${w.name}-${rel.id}`
              if (!seen.has(key)) {
                seen.add(key)
                flat.push({ ...w, track: rel.track, artist: rel.artist, albumArt: rel.albumArt, releaseDate: rel.releaseDate })
              }
            }
          }
        }
        setLeads(flat)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Pick up to 7 orbit tags from the leads list
  const orbitWriters = leads.slice(0, 7)
  const ORBIT_PARAMS = [
    { radius: 215, duration: 22, delay: 0 },
    { radius: 230, duration: 28, delay: 8 },
    { radius: 210, duration: 20, delay: 14 },
    { radius: 240, duration: 32, delay: 4 },
    { radius: 220, duration: 25, delay: 19 },
    { radius: 235, duration: 18, delay: 11 },
    { radius: 212, duration: 30, delay: 6 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 56,
        background: 'rgba(9,9,15,0.85)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(140deg, rgba(201,168,76,0.28) 0%, rgba(201,168,76,0.06) 100%)',
            border: '1px solid rgba(201,168,76,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.025em', color: 'rgba(255,255,255,0.93)' }}>Pulse</span>
          <span style={{ fontSize: 10, color: 'var(--text-disabled)', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', marginLeft: 2 }}>Publishing Intel</span>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {source === 'demo' && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
              background: 'rgba(201,168,76,0.08)', color: 'var(--gold)',
              border: '1px solid rgba(201,168,76,0.18)', letterSpacing: '0.06em',
            }}>
              DEMO MODE
            </span>
          )}
          <Link
            href="/dashboard"
            style={{
              padding: '7px 18px', borderRadius: 9,
              background: 'rgba(201,168,76,0.1)', color: 'var(--gold)',
              border: '1px solid rgba(201,168,76,0.22)',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
              letterSpacing: '-0.01em', transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(201,168,76,0.18)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(201,168,76,0.1)' }}
          >
            Enter Dashboard →
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 72, paddingBottom: 56,
        position: 'relative',
      }}>

        {/* Ambient page glow behind orb */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 500,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(130,60,255,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Scanning status pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 99, marginBottom: 44,
          background: 'rgba(62,207,142,0.07)', border: '1px solid rgba(62,207,142,0.16)',
          fontSize: 11, fontWeight: 600, color: 'var(--green)', letterSpacing: '0.06em',
          zIndex: 1,
        }}>
          <span className="live-dot" style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
          {loading
            ? 'SCANNING NEW RELEASES...'
            : `${leads.length} UNAFFILIATED WRITERS FOUND ACROSS ${releases.length} NEW RELEASES`
          }
        </div>

        {/* Orb + orbit container */}
        <div style={{ position: 'relative', width: 520, height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>

          {/* Orbit tags */}
          {!loading && orbitWriters.map((w, i) => (
            <OrbitTag
              key={`${w.name}-${i}`}
              name={w.name}
              radius={ORBIT_PARAMS[i].radius}
              duration={ORBIT_PARAMS[i].duration}
              delay={ORBIT_PARAMS[i].delay}
            />
          ))}

          {/* The orb itself */}
          <IridescentOrb
            producerCount={loading ? 0 : leads.length}
            label={loading ? 'Scanning...' : 'Unaffiliated Writers'}
            sublabel={loading ? 'pulling new releases' : 'found this week'}
          />
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginTop: 8, zIndex: 1, maxWidth: 560 }}>
          <h1 style={{
            fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em',
            color: 'rgba(255,255,255,0.96)', lineHeight: 1.15, marginBottom: 12,
          }}>
            This week's hip hop writers<br />
            <span style={{
              background: 'linear-gradient(135deg, #9b7ef8 0%, #c77dff 50%, #9b7ef8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              without a publishing deal
            </span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, fontWeight: 400 }}>
            Pulse scans every new release in real time, identifies writers with uncollected royalties,
            and surfaces them as leads — before anyone else does.
          </p>
        </div>
      </section>

      {/* ── Leads grid ───────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '0 40px 80px' }}>

        {/* Section header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, paddingBottom: 16,
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Unaffiliated Writers — New This Week
            </span>
            {!loading && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '1px 9px', borderRadius: 20,
                background: 'rgba(130,60,255,0.1)', color: 'rgba(200,160,255,0.8)',
                border: '1px solid rgba(155,126,248,0.18)',
              }}>
                {leads.length}
              </span>
            )}
          </div>
          <Link
            href="/dashboard"
            style={{
              fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
              textDecoration: 'none', letterSpacing: '-0.01em',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)' }}
          >
            Open full pipeline →
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                height: 220, borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                animation: 'pulse-live 1.8s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
        )}

        {/* Leads cards */}
        {!loading && leads.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {leads.map((lead, i) => (
              <LeadCard key={`${lead.name}-${i}`} lead={lead} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && leads.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>No unaffiliated writers found this scan.</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Check back after the next release cycle.</div>
          </div>
        )}
      </section>

    </div>
  )
}
