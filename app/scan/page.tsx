'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Panel, StatusBadge, ActionBtn } from '@/components/ui'
import { mockScanJobs } from '@/lib/mock-data'
import { generateEmailDraft } from '@/lib/email-templates'
import { saveProducer, saveEmail } from '@/lib/pipeline-store'
import type { Producer, OutreachEmail } from '@/types/database'

interface ScanLead {
  writer_name: string
  ipi_number: string | null
  pro: string | null
  publisher_status: string
  song_title: string
  isrc: string | null
  associated_artist: string
  ai_score?: number
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  estimated_monthly_royalties?: number
}

interface ScanResult {
  success: boolean
  demo?: boolean
  artist: string
  songsScanned: number
  leadsFound: number
  writersFound: number
  leads: ScanLead[]
  error?: string
}

const howItWorks = [
  {
    step: '01',
    title: 'Artist Lookup',
    desc: 'Search the Soundcharts database to locate the artist and their full catalog UUID.',
  },
  {
    step: '02',
    title: 'Catalog Pull',
    desc: "Pull up to 20 of the artist's songs with ISRC codes and release metadata.",
  },
  {
    step: '03',
    title: 'Writer Credits',
    desc: 'For each song, retrieve all registered songwriter credits including IPI numbers and PRO affiliation (ASCAP / BMI / SESAC).',
  },
  {
    step: '04',
    title: 'Publisher Check',
    desc: "Look up each writer's IPI in the publisher registry. If no publisher is on record, the writer is flagged as a lead.",
  },
  {
    step: '05',
    title: 'Lead Scoring',
    desc: 'Score each lead 0–100 based on streams, catalog depth, contact availability, and estimated uncollected royalties.',
  },
]

export default function ScanPage() {
  const router = useRouter()
  const [artistName, setArtistName] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [approvedLeads, setApprovedLeads] = useState<Set<string>>(new Set())
  const [recentJobs, setRecentJobs] = useState(mockScanJobs.slice(0, 5))

  // Read ?artist= param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const artist = params.get('artist')
    if (artist) setArtistName(artist)
  }, [])

  // Load recent jobs from API
  useEffect(() => {
    fetch('/api/scan')
      .then(r => r.json())
      .then(d => { if (d.jobs?.length) setRecentJobs(d.jobs.slice(0, 5)) })
      .catch(() => {})
  }, [])

  const handleScan = async () => {
    if (!artistName.trim() || scanning) return
    setScanning(true)
    setError(null)
    setResult(null)
    setApprovedLeads(new Set())

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName: artistName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Scan failed — check API credentials in Settings.')
      } else {
        setResult(data)
      }
    } catch {
      setError('Network error — unable to reach scan API.')
    } finally {
      setScanning(false)
    }
  }

  const handleApproveLead = (lead: ScanLead) => {
    const id = lead.ipi_number || `lead_${Date.now()}`
    const producer: Producer = {
      id,
      created_at: new Date().toISOString(),
      writer_name: lead.writer_name,
      ipi_number: lead.ipi_number,
      pro: lead.pro,
      publisher_status: lead.publisher_status as Producer['publisher_status'],
      outreach_status: 'APPROVED',
      ai_score: lead.ai_score ?? null,
      priority: (lead.priority as Producer['priority']) ?? null,
      estimated_monthly_royalties: lead.estimated_monthly_royalties ?? null,
      instagram: null,
      email: null,
      twitter: null,
      spotify_streams: null,
      catalog_count: null,
      associated_artists: [lead.associated_artist],
      top_song: lead.song_title,
      reasoning: `No publisher found on "${lead.song_title}" — uncollected publisher's share`,
      notes: null,
    }

    const draft = generateEmailDraft(producer)
    const email: OutreachEmail = {
      id: `email_${Date.now()}`,
      created_at: new Date().toISOString(),
      producer_id: id,
      ...draft,
      status: 'DRAFT',
      sent_at: null,
      opened_at: null,
      clicked_at: null,
      replied_at: null,
      template_used: 'uncollected-royalties',
      sendgrid_message_id: null,
    }

    saveProducer(producer)
    saveEmail(email)
    setApprovedLeads(prev => { const next = new Set(prev); next.add(lead.writer_name); return next })

    // Also call API in background
    fetch('/api/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producerId: id, producerData: producer }),
    }).catch(() => {})
  }

  const handleApproveAll = () => {
    if (!result?.leads) return
    result.leads.forEach(lead => {
      if (!approvedLeads.has(lead.writer_name)) handleApproveLead(lead)
    })
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: 5 }}>
          Scan Engine
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
          Search an artist's catalog for writers with no publisher on record — identifies uncollected publishing royalties via IPI/PRO lookup
        </p>
      </div>

      {/* ── How It Works ───────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <Panel title="How It Works">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {howItWorks.map(item => (
              <div key={item.step}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.08em', marginBottom: 6 }}>
                  {item.step}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* ── PRO Data Sources ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { name: 'ASCAP', desc: 'American Society of Composers, Authors and Publishers — IPI registry + publisher lookup', color: '#5280E0' },
          { name: 'BMI', desc: 'Broadcast Music Inc. — Writer registration, work registration + publisher affiliation check', color: '#4CAF82' },
          { name: 'SESAC / GMR', desc: 'Society of European Stage Authors & Composers + Global Music Rights — boutique PRO coverage', color: '#C9A84C' },
        ].map(pro => (
          <div key={pro.name} className="glass-card" style={{ padding: '14px 16px', borderLeft: `2px solid ${pro.color}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{pro.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{pro.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 16, marginBottom: 16 }}>

        {/* ── Scan Input ──────────────────────────────────── */}
        <Panel title="Run Artist Scan">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                Artist Name
              </label>
              <input
                value={artistName}
                onChange={e => setArtistName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                placeholder="e.g. Lil Durk, Polo G, Rod Wave..."
                disabled={scanning}
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  opacity: scanning ? 0.6 : 1,
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                Searches Soundcharts → pulls catalog → checks each writer's IPI against ASCAP/BMI publisher registry
              </div>
            </div>

            <ActionBtn
              variant="gold"
              onClick={handleScan}
              disabled={!artistName.trim() || scanning}
            >
              {scanning ? '⟳  Scanning...' : '▶  Run Scan'}
            </ActionBtn>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(224,82,82,0.08)',
                border: '1px solid rgba(224,82,82,0.2)',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 12,
                color: '#E05252',
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Results */}
            {result && (
              <div>
                {/* Demo banner */}
                {result.demo && (
                  <div style={{
                    background: 'rgba(201,168,76,0.07)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 12,
                    fontSize: 11,
                    color: 'var(--gold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span style={{ fontWeight: 700 }}>⚠ DEMO MODE</span>
                    <span style={{ color: 'var(--text-muted)' }}>— Add your Soundcharts API token in Settings to scan real databases</span>
                  </div>
                )}

                <div style={{
                  background: 'rgba(76,175,130,0.07)',
                  border: '1px solid rgba(76,175,130,0.18)',
                  borderRadius: 8,
                  padding: '14px 16px',
                  marginBottom: 12,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#4CAF82', marginBottom: 8 }}>
                    ✓ Scan complete — {result.artist}
                  </div>
                  <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span><strong style={{ color: 'var(--text-primary)' }}>{result.songsScanned}</strong> songs scanned</span>
                    <span><strong style={{ color: 'var(--text-primary)' }}>{result.writersFound}</strong> writers found</span>
                    <span><strong style={{ color: result.leadsFound > 0 ? '#4CAF82' : 'var(--text-primary)' }}>{result.leadsFound}</strong> leads (no publisher)</span>
                  </div>
                </div>

                {result.leads.length > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {approvedLeads.size > 0
                          ? `${approvedLeads.size} lead${approvedLeads.size > 1 ? 's' : ''} approved — email drafts created`
                          : 'Approve leads to create outreach email drafts'}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {approvedLeads.size > 0 && (
                          <ActionBtn size="sm" variant="green" onClick={() => router.push('/outreach')}>
                            View Drafts →
                          </ActionBtn>
                        )}
                        <ActionBtn
                          size="sm"
                          variant="gold"
                          onClick={handleApproveAll}
                          disabled={approvedLeads.size === result.leads.length}
                        >
                          Approve All
                        </ActionBtn>
                      </div>
                    </div>

                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Writer</th>
                          <th>PRO</th>
                          <th>IPI</th>
                          <th>Song</th>
                          <th>Score</th>
                          <th>Est. Monthly</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.leads.map((lead, i) => {
                          const approved = approvedLeads.has(lead.writer_name)
                          return (
                            <tr key={i}>
                              <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                                {lead.writer_name}
                              </td>
                              <td>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                                  {lead.pro || '—'}
                                </span>
                              </td>
                              <td style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {lead.ipi_number || '—'}
                              </td>
                              <td>
                                <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{lead.song_title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{lead.associated_artist}</div>
                              </td>
                              <td>
                                {lead.ai_score != null && (
                                  <span style={{
                                    fontSize: 12, fontWeight: 700,
                                    color: lead.ai_score >= 70 ? '#4CAF82' : lead.ai_score >= 40 ? '#C9A84C' : 'var(--text-muted)',
                                  }}>
                                    {lead.ai_score}
                                  </span>
                                )}
                              </td>
                              <td>
                                {lead.estimated_monthly_royalties ? (
                                  <span style={{ color: '#4CAF82', fontWeight: 600, fontSize: 12 }}>
                                    ${lead.estimated_monthly_royalties.toLocaleString()}/mo
                                  </span>
                                ) : '—'}
                              </td>
                              <td><StatusBadge status="NO_PUBLISHER" /></td>
                              <td>
                                {approved ? (
                                  <span style={{ fontSize: 11, color: '#4CAF82', fontWeight: 600 }}>✓ Approved</span>
                                ) : (
                                  <ActionBtn size="sm" variant="green" onClick={() => handleApproveLead(lead)}>
                                    Approve
                                  </ActionBtn>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>

                    {approvedLeads.size > 0 && (
                      <div style={{ marginTop: 12, textAlign: 'center' }}>
                        <ActionBtn variant="gold" onClick={() => router.push('/outreach')}>
                          View Email Drafts in Outreach →
                        </ActionBtn>
                      </div>
                    )}
                  </>
                )}

                {result.leads.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                    No unrepresented writers found in this catalog
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>

        {/* ── Scan Tips ───────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Panel title="Best Targets">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { artist: 'Lil Durk', note: 'High catalog volume · Drill' },
                { artist: 'NBA YoungBoy', note: 'Prolific releases · Trap' },
                { artist: 'Rod Wave', note: 'Soul trap · High streams' },
                { artist: 'Polo G', note: 'Self-written · Drill' },
                { artist: 'EST Gee', note: 'Emerging · Less coverage' },
                { artist: 'Fivio Foreign', note: 'Brooklyn Drill · NY scene' },
              ].map(t => (
                <button
                  key={t.artist}
                  onClick={() => setArtistName(t.artist)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: artistName === t.artist ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${artistName === t.artist ? 'rgba(201,168,76,0.25)' : 'var(--border)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: artistName === t.artist ? 'var(--gold)' : 'var(--text-primary)' }}>
                    {t.artist}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.note}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Publisher Check Logic">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p>
                A writer is flagged as a <strong style={{ color: '#E05252' }}>No Publisher</strong> lead when their IPI number returns no affiliated publisher name from the Soundcharts publisher registry.
              </p>
              <p>
                This means they are collecting only their <strong style={{ color: 'var(--text-primary)' }}>writer's share</strong> from their PRO (ASCAP or BMI). The <strong style={{ color: 'var(--gold)' }}>publisher's share</strong> — an equal 50% split — sits uncollected.
              </p>
              <div style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 6, padding: '10px 12px', marginTop: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.07em', marginBottom: 4 }}>WHAT IS UNCOLLECTED</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>• Streaming performance royalties (Spotify, Apple, Amazon)</span>
                  <span>• YouTube Content ID mechanical</span>
                  <span>• Radio performance (ASCAP/BMI blanket)</span>
                  <span>• International digital mechanicals</span>
                  <span>• Sync licensing publisher's share</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* ── Recent Scans ───────────────────────────────── */}
      <Panel title="Recent Scans" badge={recentJobs.length} noPad>
        <table className="data-table">
          <thead>
            <tr>
              <th>Artist</th>
              <th>Status</th>
              <th>Songs</th>
              <th>Writers</th>
              <th>Leads</th>
              <th>Source</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentJobs.map(job => (
              <tr key={job.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', fontSize: 13 }}>
                  {job.artist_name}
                </td>
                <td><StatusBadge status={job.status} /></td>
                <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{job.songs_scanned}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{job.writers_found}</td>
                <td>
                  <span style={{
                    color: job.leads_found > 0 ? 'var(--green)' : 'var(--text-muted)',
                    fontWeight: job.leads_found > 0 ? 700 : 400,
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: 13,
                  }}>
                    {job.leads_found}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {job.triggered_by}
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
  )
}
