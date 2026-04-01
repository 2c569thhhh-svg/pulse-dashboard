'use client'

import { useState, useEffect } from 'react'
import { Panel, StatusBadge, ActionBtn } from '@/components/ui'
import { mockScanJobs } from '@/lib/mock-data'
import type { NewRelease } from '@/lib/types'

const QUICK_ARTISTS = [
  'Lil Durk', 'Polo G', 'Rod Wave', 'NBA YoungBoy',
  'Moneybagg Yo', 'EST Gee', 'Key Glock', '42 Dugg',
  'Future', 'Lil Baby', 'Gunna', 'Playboi Carti',
  'Young Thug', 'Fivio Foreign', 'Drake', 'Meek Mill',
]

const SCAN_STEPS = [
  { label: 'Searching artist catalog…', pct: 18 },
  { label: 'Fetching songs from Soundcharts…', pct: 35 },
  { label: 'Cross-referencing PRO databases…', pct: 55 },
  { label: 'Checking publisher registration…', pct: 72 },
  { label: 'Analyzing uncollected royalties…', pct: 88 },
  { label: 'Finalizing leads…', pct: 96 },
]

interface Lead {
  writer_name: string
  ipi_number: string | null
  pro: string | null
  publisher_status: string
  song_title: string
  associated_artist: string
  role?: string
}

interface ScanResult {
  artist: string
  songsScanned: number
  leadsFound: number
  leads: Lead[]
  source?: 'soundcharts' | 'musicbrainz' | 'demo'
}

type ScanState = 'idle' | 'running' | 'done' | 'error'
type ActiveTab = 'releases' | 'scan'

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  soundcharts: { label: 'Soundcharts', color: '#3ecf8e' },
  demo:        { label: 'Demo Mode',   color: '#C9A84C' },
}

// ── Release Card ──────────────────────────────────────────────────────────────
function ReleaseCard({
  release,
  onScanArtist,
  onAddLead,
  addedSet,
}: {
  release: NewRelease
  onScanArtist: (artist: string) => void
  onAddLead: (writer: string, release: NewRelease) => void
  addedSet: Set<string>
}) {
  const unaffiliated = release.writers.filter(w => !w.hasPublisher)
  const hasLeads = unaffiliated.length > 0

  return (
    <div style={{
      borderRadius: 12,
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${hasLeads ? 'rgba(224,139,82,0.25)' : 'rgba(255,255,255,0.07)'}`,
      borderLeft: hasLeads ? '3px solid rgba(224,139,82,0.6)' : '1px solid rgba(255,255,255,0.07)',
      overflow: 'hidden',
      transition: 'border-color 0.15s, background 0.15s',
      display: 'flex',
      flexDirection: 'column',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.048)' }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
    >
      {/* Album art + meta */}
      <div style={{ display: 'flex', gap: 12, padding: '14px 14px 10px' }}>
        {/* Art */}
        <div style={{
          width: 52, height: 52, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(91,141,239,0.15))',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {release.albumArt ? (
            <img src={release.albumArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 20 }}>🎵</span>
          )}
        </div>

        {/* Track info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: 2,
          }}>
            {release.track}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
            {release.artist}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {release.album}
            </span>
            {/* Popularity bar */}
            <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 99, maxWidth: 48 }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${release.popularity ?? 70}%`,
                background: 'linear-gradient(90deg, #C9A84C, #E2C97E)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Writers section */}
      <div style={{ padding: '0 14px 12px', flex: 1 }}>
        {release.writers.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {release.writers.map(w => {
              const isAdded = addedSet.has(w.name)
              const isUnaffiliated = !w.hasPublisher
              return (
                <button
                  key={w.name}
                  onClick={() => isUnaffiliated && !isAdded && onAddLead(w.name, release)}
                  title={isUnaffiliated ? `${w.name} — no publisher. Click to add to pipeline.` : `${w.name} — has publisher`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontWeight: isUnaffiliated ? 700 : 400,
                    padding: '3px 8px', borderRadius: 20,
                    background: isAdded
                      ? 'rgba(62,207,142,0.12)'
                      : isUnaffiliated
                      ? 'rgba(224,139,82,0.12)'
                      : 'rgba(255,255,255,0.04)',
                    border: isAdded
                      ? '1px solid rgba(62,207,142,0.3)'
                      : isUnaffiliated
                      ? '1px solid rgba(224,139,82,0.3)'
                      : '1px solid rgba(255,255,255,0.07)',
                    color: isAdded
                      ? '#3ecf8e'
                      : isUnaffiliated
                      ? '#E08B52'
                      : 'var(--text-muted)',
                    cursor: isUnaffiliated && !isAdded ? 'pointer' : 'default',
                    transition: 'all 0.14s',
                  }}
                >
                  {isAdded ? '✓' : isUnaffiliated ? '●' : ''}
                  {' '}{w.name}
                  {isUnaffiliated && !isAdded && w.estimatedMonthly && (
                    <span style={{ color: '#C9A84C', fontSize: 10 }}>
                      ${(w.estimatedMonthly / 1000).toFixed(1)}k/mo
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--text-disabled)' }}>Writer data loading…</div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.12)',
      }}>
        {hasLeads ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#E08B52' }}>
            {unaffiliated.length} unaffiliated producer{unaffiliated.length > 1 ? 's' : ''}
          </span>
        ) : (
          <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>All affiliated</span>
        )}
        <button
          onClick={() => onScanArtist(release.artist)}
          style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
            background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
            color: '#C9A84C', cursor: 'pointer', transition: 'all 0.14s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(201,168,76,0.15)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(201,168,76,0.08)'
          }}
        >
          Scan Artist →
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ScanPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('releases')
  const [artist, setArtist] = useState('')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [addedLeads, setAddedLeads] = useState<Set<string>>(new Set())

  // New releases state
  const [releases, setReleases] = useState<NewRelease[]>([])
  const [releasesLoading, setReleasesLoading] = useState(true)
  const [releasesError, setReleasesError] = useState('')
  const [addedFromReleases, setAddedFromReleases] = useState<Set<string>>(new Set())

  // Load releases on mount
  useEffect(() => {
    fetchReleases()
  }, [])

  async function fetchReleases() {
    setReleasesLoading(true)
    setReleasesError('')
    try {
      const res = await fetch('/api/new-releases')
      const data = await res.json()
      setReleases(data.releases ?? data ?? [])
    } catch {
      setReleasesError('Could not load releases')
    } finally {
      setReleasesLoading(false)
    }
  }

  // Progress animation
  useEffect(() => {
    if (scanState !== 'running') return
    let i = 0
    setStepIdx(0)
    setProgress(0)
    const interval = setInterval(() => {
      i++
      if (i < SCAN_STEPS.length) {
        setStepIdx(i)
        setProgress(SCAN_STEPS[i].pct)
      }
    }, 900)
    return () => clearInterval(interval)
  }, [scanState])

  async function runScan(artistName: string) {
    if (!artistName.trim()) return
    setScanState('running')
    setResult(null)
    setErrorMsg('')
    setArtist(artistName)
    setStepIdx(0)
    setProgress(SCAN_STEPS[0].pct)
    setActiveTab('scan')

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName: artistName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setProgress(100)
      setResult(data)
      setScanState('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setScanState('error')
    }
  }

  async function addToPipeline(lead: Lead) {
    try {
      await fetch('/api/producers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writer_name: lead.writer_name,
          ipi_number: lead.ipi_number,
          pro: lead.pro,
          publisher_status: lead.publisher_status,
          outreach_status: 'PENDING',
          associated_artists: [lead.associated_artist],
          top_song: lead.song_title,
        }),
      })
    } catch { /* Supabase optional */ }
    setAddedLeads(prev => new Set(Array.from(prev).concat(lead.writer_name)))
  }

  function addFromRelease(writerName: string, release: NewRelease) {
    setAddedFromReleases(prev => new Set(Array.from(prev).concat(writerName)))
    // Add as a lead
    const writer = release.writers.find(w => w.name === writerName)
    if (!writer) return
    addToPipeline({
      writer_name: writerName,
      ipi_number: writer.ipi ?? null,
      pro: writer.pro ?? null,
      publisher_status: 'NO_PUBLISHER',
      song_title: release.track,
      associated_artist: release.artist,
    })
  }

  async function addAllToPipeline() {
    if (!result?.leads.length) return
    for (const lead of result.leads) {
      await addToPipeline(lead)
    }
  }

  const totalUnaffiliated = releases.reduce((n, r) => n + r.writers.filter(w => !w.hasPublisher).length, 0)
  const sourceInfo = result?.source ? SOURCE_LABELS[result.source] : null

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1280 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.035em' }}>
            Scan Engine
          </h1>
          {sourceInfo && activeTab === 'scan' && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '2px 10px', borderRadius: 99,
              background: `${sourceInfo.color}18`, border: `1px solid ${sourceInfo.color}35`,
              color: sourceInfo.color,
            }}>
              via {sourceInfo.label}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          This week's new releases with unaffiliated producers highlighted — or scan any artist manually.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[
          {
            key: 'releases' as ActiveTab,
            label: '🎵 New Releases',
            badge: totalUnaffiliated > 0 ? `${totalUnaffiliated} leads` : null,
            badgeColor: '#E08B52',
          },
          {
            key: 'scan' as ActiveTab,
            label: '🔍 Scan Artist',
            badge: scanState === 'done' && result ? `${result.leadsFound} found` : null,
            badgeColor: '#3ecf8e',
          },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${activeTab === tab.key ? 'var(--gold)' : 'transparent'}`,
              marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.label}
            {tab.badge && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
                background: `${tab.badgeColor}20`, color: tab.badgeColor,
                border: `1px solid ${tab.badgeColor}40`,
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── New Releases Tab ── */}
      {activeTab === 'releases' && (
        <div>
          {/* Sub-header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                This Week in Hip-Hop
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>
                {releases.length} releases · <span style={{ color: '#E08B52', fontWeight: 600 }}>{totalUnaffiliated} unaffiliated producers spotted</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="live-dot" style={{ width: 6, height: 6, background: '#3ecf8e', borderRadius: '50%' }} />
              <span style={{ fontSize: 11, color: '#3ecf8e', fontWeight: 600, letterSpacing: '0.05em' }}>
                LIVE
              </span>
              <button
                onClick={fetchReleases}
                disabled={releasesLoading}
                style={{
                  fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-secondary)', cursor: releasesLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {releasesLoading ? '⟳ Refreshing…' : '↻ Refresh'}
              </button>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E08B52', display: 'inline-block' }} />
              Unaffiliated producer — click to add to pipeline
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />
              Has publisher
            </span>
          </div>

          {/* Releases grid */}
          {releasesLoading ? (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
            }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  height: 160, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  animation: 'pulse-live 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                }} />
              ))}
            </div>
          ) : releasesError ? (
            <div style={{
              padding: '32px', textAlign: 'center', borderRadius: 12,
              background: 'rgba(241,96,96,0.05)', border: '1px solid rgba(241,96,96,0.15)',
              color: '#f16060', fontSize: 13,
            }}>
              {releasesError}
              <button onClick={fetchReleases} style={{ marginLeft: 12, textDecoration: 'underline', background: 'none', border: 'none', color: '#f16060', cursor: 'pointer', fontSize: 13 }}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 12,
              }}>
                {releases.map(release => (
                  <ReleaseCard
                    key={release.id}
                    release={release}
                    onScanArtist={runScan}
                    onAddLead={addFromRelease}
                    addedSet={addedFromReleases}
                  />
                ))}
              </div>

              {addedFromReleases.size > 0 && (
                <div style={{
                  marginTop: 16, padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(62,207,142,0.07)', border: '1px solid rgba(62,207,142,0.2)',
                  fontSize: 13, color: '#3ecf8e', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span>✓</span>
                  <span>{addedFromReleases.size} producer{addedFromReleases.size > 1 ? 's' : ''} added to pipeline from this week's releases.</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Scan Artist Tab ── */}
      {activeTab === 'scan' && (
        <div>
          {/* Search box */}
          <div style={{ marginBottom: 20 }}>
          <Panel>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="input-dark"
                placeholder="Enter artist name (e.g. Lil Durk, Future, Gunna)…"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runScan(artist)}
                style={{ flex: 1, fontSize: 14 }}
                autoFocus
              />
              <ActionBtn
                variant="gold"
                onClick={() => runScan(artist)}
                disabled={scanState === 'running' || !artist.trim()}
              >
                {scanState === 'running' ? '⟳ Scanning…' : '▶ Run Scan'}
              </ActionBtn>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                Quick Select
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK_ARTISTS.map(a => (
                  <button
                    key={a}
                    onClick={() => runScan(a)}
                    disabled={scanState === 'running'}
                    style={{
                      padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                      background: artist === a ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${artist === a ? 'rgba(201,168,76,0.3)' : 'var(--border)'}`,
                      color: artist === a ? 'var(--gold)' : 'var(--text-secondary)',
                      cursor: scanState === 'running' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.14s ease',
                    }}
                    onMouseEnter={e => {
                      if (scanState === 'running') return
                      e.currentTarget.style.background = 'rgba(201,168,76,0.1)'
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'
                      e.currentTarget.style.color = 'var(--gold)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = artist === a ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.borderColor = artist === a ? 'rgba(201,168,76,0.3)' : 'var(--border)'
                      e.currentTarget.style.color = artist === a ? 'var(--gold)' : 'var(--text-secondary)'
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </Panel>
          </div>

          {/* Scanning progress */}
          {scanState === 'running' && (
            <div style={{
              padding: '24px', borderRadius: 16, marginBottom: 20,
              background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <span className="spin" style={{ fontSize: 20, display: 'inline-block', color: 'var(--gold)' }}>⟳</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)' }}>Scanning {artist}…</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{SCAN_STEPS[stepIdx]?.label}</div>
                </div>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99, width: `${progress}%`,
                  background: 'linear-gradient(90deg, #C9A84C, #E2C97E)',
                  transition: 'width 0.8s ease',
                }} />
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SCAN_STEPS.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                    color: i < stepIdx ? 'var(--text-secondary)' : i === stepIdx ? 'var(--text-primary)' : 'var(--text-disabled)',
                    transition: 'color 0.3s',
                  }}>
                    <span style={{ fontSize: 10, width: 14, textAlign: 'center' }}>
                      {i < stepIdx ? '✓' : i === stepIdx ? '▶' : '○'}
                    </span>
                    {step.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {scanState === 'error' && (
            <div style={{
              padding: '16px 20px', borderRadius: 12, marginBottom: 20,
              background: 'rgba(224,82,82,0.07)', border: '1px solid rgba(224,82,82,0.18)',
              fontSize: 13, color: '#f16060',
            }}>
              <strong>Scan failed:</strong> {errorMsg}
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                Try a different artist name, or check your API credentials in Settings.
              </div>
            </div>
          )}

          {/* Results */}
          {scanState === 'done' && result && (
            <div style={{ marginBottom: 20 }}>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Artist',              value: result.artist,       color: 'var(--text-primary)' },
                  { label: 'Songs Scanned',        value: result.songsScanned, color: 'var(--gold)' },
                  { label: 'Unaffiliated Writers', value: result.leadsFound,   color: result.leadsFound > 0 ? 'var(--green)' : 'var(--text-muted)' },
                ].map(s => (
                  <div key={s.label} className="glow-card" style={{ padding: '18px 20px' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: s.color }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Data source notice */}
              {result.source === 'demo' && (
                <div style={{
                  padding: '10px 16px', borderRadius: 10, marginBottom: 16,
                  background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)',
                  fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8,
                }}>
                  <span>⚡</span>
                  <span>Demo data — real data requires Soundcharts API credentials in Settings.</span>
                </div>
              )}

              {result.leads.length > 0 ? (
                <Panel
                  title="Unaffiliated Writers Found"
                  badge={result.leads.length}
                  noPad
                  action={
                    <ActionBtn size="sm" variant="gold" onClick={addAllToPipeline}>
                      + Add All to Pipeline
                    </ActionBtn>
                  }
                >
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Writer / Producer</th>
                        <th>Song</th>
                        <th>PRO</th>
                        <th>IPI</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.leads.map((lead, i) => {
                        const added = addedLeads.has(lead.writer_name)
                        return (
                          <tr key={i}>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.writer_name}</div>
                              {lead.role && (
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 1 }}>{lead.role}</div>
                              )}
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>{lead.song_title}</td>
                            <td>
                              {lead.pro
                                ? <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{lead.pro}</span>
                                : <span style={{ color: 'var(--text-disabled)' }}>—</span>}
                            </td>
                            <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, color: 'var(--text-muted)' }}>
                              {lead.ipi_number || <span style={{ color: 'var(--text-disabled)' }}>—</span>}
                            </td>
                            <td><StatusBadge status={lead.publisher_status} /></td>
                            <td>
                              {added ? (
                                <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>✓ Added</span>
                              ) : (
                                <ActionBtn size="sm" variant="green" onClick={() => addToPipeline(lead)}>
                                  + Pipeline
                                </ActionBtn>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div style={{
                    padding: '14px 20px', fontSize: 12, color: 'var(--text-muted)',
                    borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)',
                  }}>
                    {result.leadsFound} lead{result.leadsFound !== 1 ? 's' : ''} found in {result.artist}&apos;s catalog.
                  </div>
                </Panel>
              ) : (
                <div style={{
                  padding: '40px 24px', textAlign: 'center', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontSize: 13,
                }}>
                  No unaffiliated writers found for <strong>{result.artist}</strong>.
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    All credited writers appear to have publisher affiliations, or writer credits weren&apos;t available for this artist.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent scans */}
          <Panel title="Recent Scans" badge={mockScanJobs.length} noPad>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Artist</th>
                  <th>Status</th>
                  <th>Songs</th>
                  <th>Leads</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {mockScanJobs.map(job => (
                  <tr
                    key={job.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => job.artist_name && runScan(job.artist_name)}
                  >
                    <td style={{ fontWeight: 500 }}>{job.artist_name}</td>
                    <td><StatusBadge status={job.status} /></td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{job.songs_scanned}</td>
                    <td>
                      <span style={{ color: job.leads_found > 0 ? 'var(--green)' : 'var(--text-muted)', fontWeight: job.leads_found > 0 ? 600 : 400 }}>
                        {job.leads_found}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      )}
    </div>
  )
}
