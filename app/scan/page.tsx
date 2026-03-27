'use client'

import { useState } from 'react'
import { Panel, StatusBadge, ScoreBadge, ActionBtn } from '@/components/ui'
import { mockScanJobs } from '@/lib/mock-data'

const QUICK_ARTISTS = [
  'Lil Durk', 'Polo G', 'Rod Wave', 'NBA YoungBoy',
  'Moneybagg Yo', 'EST Gee', 'Key Glock', '42 Dugg',
  'Fivio Foreign', 'Sleepy Hallow', 'Gunna', 'Future',
]

interface ScanResult {
  artist: string
  songsScanned: number
  leadsFound: number
  demo?: boolean
  leads: Array<{
    writer_name: string
    ipi_number: string | null
    pro: string | null
    publisher_status: string
    song_title: string
    associated_artist: string
  }>
}

type ScanState = 'idle' | 'running' | 'done' | 'error'

export default function ScanPage() {
  const [artist, setArtist] = useState('')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function runScan(artistName: string) {
    if (!artistName.trim()) return
    setScanState('running')
    setResult(null)
    setErrorMsg('')
    setArtist(artistName)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName: artistName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data)
      setScanState('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setScanState('error')
    }
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.035em', color: 'rgba(255,255,255,0.96)', marginBottom: 6 }}>
          Scan Engine
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Search an artist&apos;s catalog — find writers with no publishing deal
          </p>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '2px 8px', borderRadius: 99,
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
            color: 'var(--gold)',
          }}>DEMO MODE</span>
        </div>
      </div>

      {/* Search input */}
      <div style={{ marginBottom: 20 }}>
      <Panel>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="input-dark"
            placeholder="Enter artist name (e.g. Lil Durk)..."
            value={artist}
            onChange={e => setArtist(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runScan(artist)}
            style={{ flex: 1, fontSize: 14 }}
          />
          <ActionBtn
            variant="gold"
            onClick={() => runScan(artist)}
            disabled={scanState === 'running' || !artist.trim()}
          >
            {scanState === 'running' ? '⟳ Scanning...' : '▶ Run Scan'}
          </ActionBtn>
        </div>

        {/* Quick-select artists */}
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
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  transition: 'all 0.14s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.background = 'rgba(201,168,76,0.1)'
                  el.style.borderColor = 'rgba(201,168,76,0.25)'
                  el.style.color = 'var(--gold)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.background = 'rgba(255,255,255,0.04)'
                  el.style.borderColor = 'var(--border)'
                  el.style.color = 'var(--text-secondary)'
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </Panel>
      </div>

      {/* Scanning indicator */}
      {scanState === 'running' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '20px 24px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)',
        }}>
          <span className="spin" style={{ fontSize: 18, color: 'var(--gold)' }}>⟳</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>
              Scanning {artist}...
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Pulling catalog → checking writers → looking up publisher status via IPI
            </div>
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
          Scan failed: {errorMsg}
        </div>
      )}

      {/* Results */}
      {scanState === 'done' && result && (
        <div style={{ marginBottom: 20 }}>
          {/* Summary */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16,
          }}>
            {[
              { label: 'Songs Scanned', value: result.songsScanned, color: 'var(--gold)' },
              { label: 'Leads Found', value: result.leadsFound, color: result.leadsFound > 0 ? 'var(--green)' : 'var(--text-muted)' },
              { label: 'Artist', value: result.artist, color: 'var(--text-primary)' },
            ].map(stat => (
              <div key={stat.label} className="glow-card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Leads table */}
          {result.leads.length > 0 ? (
            <Panel title="Unaffiliated Writers Found" badge={result.leads.length} noPad>
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
                  {result.leads.map((lead, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.writer_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{lead.song_title}</td>
                      <td>{lead.pro || <span style={{ color: 'var(--text-disabled)' }}>—</span>}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, color: 'var(--text-muted)' }}>
                        {lead.ipi_number || <span style={{ color: 'var(--text-disabled)' }}>—</span>}
                      </td>
                      <td><StatusBadge status={lead.publisher_status} /></td>
                      <td>
                        <ActionBtn size="sm" variant="green">Add to Pipeline</ActionBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          ) : (
            <div style={{
              padding: '40px 24px', textAlign: 'center', borderRadius: 12,
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: 13,
            }}>
              No unaffiliated writers found for {result.artist}. All writers appear to have publishers.
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
              <tr key={job.id}>
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
