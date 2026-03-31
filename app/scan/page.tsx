'use client'

import { useState, useEffect } from 'react'
import { Panel, StatusBadge, ActionBtn } from '@/components/ui'
import { mockScanJobs } from '@/lib/mock-data'

const QUICK_ARTISTS = [
  'Lil Durk', 'Polo G', 'Rod Wave', 'NBA YoungBoy',
  'Moneybagg Yo', 'EST Gee', 'Key Glock', '42 Dugg',
  'Fivio Foreign', 'Sleepy Hallow', 'Gunna', 'Future',
]

const SCAN_STEPS = [
  { label: 'Searching artist catalog…', pct: 18 },
  { label: 'Fetching songs from Soundcharts…', pct: 35 },
  { label: 'Cross-referencing PRO databases…', pct: 55 },
  { label: 'Checking publisher registration via IPI…', pct: 72 },
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
  mb_work_id?: string
}

interface ScanResult {
  artist: string
  songsScanned: number
  leadsFound: number
  leads: Lead[]
  source?: 'soundcharts' | 'musicbrainz' | 'demo'
}

type ScanState = 'idle' | 'running' | 'done' | 'error'

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  soundcharts: { label: 'Soundcharts', color: '#3ecf8e' },
  musicbrainz: { label: 'MusicBrainz', color: '#5b8def' },
  demo: { label: 'Demo Mode', color: '#C9A84C' },
}

export default function ScanPage() {
  const [artist, setArtist] = useState('')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [addedLeads, setAddedLeads] = useState<Set<string>>(new Set())

  // Progress animation while scanning
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
    } catch { /* Supabase may not be configured */ }
    setAddedLeads(prev => new Set([...prev, lead.writer_name]))
  }

  async function addAllToPipeline() {
    if (!result?.leads.length) return
    for (const lead of result.leads) {
      await addToPipeline(lead)
    }
  }

  const sourceInfo = result?.source ? SOURCE_LABELS[result.source] : null

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.035em', color: 'rgba(255,255,255,0.96)' }}>
            Scan Engine
          </h1>
          {sourceInfo && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '2px 10px', borderRadius: 99,
              background: `${sourceInfo.color}18`,
              border: `1px solid ${sourceInfo.color}35`,
              color: sourceInfo.color,
            }}>
              via {sourceInfo.label}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Enter any artist — Pulse scans their catalog and surfaces writers with no publisher
        </p>
      </div>

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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {QUICK_ARTISTS.map(a => (
                <button
                  key={a}
                  onClick={() => runScan(a)}
                  disabled={scanState === 'running'}
                  style={{
                    padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                    background: artist === a ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${artist === a ? 'rgba(201,168,76,0.3)' : 'var(--border)'}`,
                    color: artist === a ? 'var(--gold)' : 'var(--text-secondary)',
                    cursor: scanState === 'running' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.14s ease',
                  }}
                  onMouseEnter={e => {
                    if (scanState === 'running') return
                    const el = e.currentTarget
                    el.style.background = 'rgba(201,168,76,0.1)'
                    el.style.borderColor = 'rgba(201,168,76,0.25)'
                    el.style.color = 'var(--gold)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.background = artist === a ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)'
                    el.style.borderColor = artist === a ? 'rgba(201,168,76,0.3)' : 'var(--border)'
                    el.style.color = artist === a ? 'var(--gold)' : 'var(--text-secondary)'
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
            <span style={{ fontSize: 20, animation: 'spin 1s linear infinite', display: 'inline-block', color: 'var(--gold)' }}>⟳</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)' }}>
                Scanning {artist}…
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {SCAN_STEPS[stepIdx]?.label}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99, width: `${progress}%`,
              background: 'linear-gradient(90deg, #C9A84C, #E2C97E)',
              transition: 'width 0.8s ease',
            }} />
          </div>

          {/* Step list */}
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
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Songs Scanned', value: result.songsScanned, color: 'var(--gold)' },
              { label: 'Unaffiliated Writers', value: result.leadsFound, color: result.leadsFound > 0 ? 'var(--green)' : 'var(--text-muted)' },
              { label: 'Artist', value: result.artist, color: 'var(--text-primary)' },
            ].map(s => (
              <div key={s.label} className="glow-card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Data source notice */}
          {result.source === 'musicbrainz' && (
            <div style={{
              padding: '10px 16px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(91,141,239,0.06)', border: '1px solid rgba(91,141,239,0.15)',
              fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <span>ℹ</span>
              <span>
                Data sourced from MusicBrainz (open music database). Add your Soundcharts credentials to Settings for richer publisher data including IPI numbers.
              </span>
            </div>
          )}
          {result.source === 'demo' && (
            <div style={{
              padding: '10px 16px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)',
              fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <span>⚡</span>
              <span>
                Demo data shown. Add your Soundcharts API key to Settings to scan real catalog data with verified IPI numbers.
              </span>
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
                    <th>Writer</th>
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
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {lead.writer_name}
                          </div>
                          {lead.role && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 1 }}>
                              {lead.role}
                            </div>
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
                borderTop: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.15)',
              }}>
                Pulse found {result.leadsFound} lead{result.leadsFound !== 1 ? 's' : ''} in {result.artist}&apos;s catalog.
                {result.source === 'soundcharts' && ' Publisher status verified against BMI/ASCAP via IPI.'}
                {result.source === 'musicbrainz' && ' Writer credits sourced from MusicBrainz open database.'}
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
                All credited writers appear to have publisher affiliations, or writer credits were not available for this artist.
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
              <th>Writers</th>
              <th>Leads</th>
              <th>Triggered By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {mockScanJobs.map(job => (
              <tr key={job.id} style={{ cursor: 'pointer' }} onClick={() => job.artist_name && runScan(job.artist_name)}>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{job.artist_name}</td>
                <td><StatusBadge status={job.status} /></td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{job.songs_scanned}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{job.writers_found}</td>
                <td>
                  <span style={{ color: job.leads_found > 0 ? 'var(--green)' : 'var(--text-muted)', fontWeight: job.leads_found > 0 ? 600 : 400 }}>
                    {job.leads_found}
                  </span>
                </td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {job.triggered_by}
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
  )
}
