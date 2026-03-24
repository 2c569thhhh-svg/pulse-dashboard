'use client'

import { StatCard, Panel, StatusBadge, ScoreBadge, Streams, ActionBtn } from '@/components/ui'
import { mockProducers, mockScanJobs, mockStats } from '@/lib/mock-data'

export default function DashboardPage() {
  const highPriority = mockProducers.filter(p => p.priority === 'HIGH')
  const recentJobs = mockScanJobs.slice(0, 4)

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
          <h1 style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
          }}>
            Command Center
          </h1>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '2px 9px',
            borderRadius: 99,
            background: 'rgba(62,207,142,0.1)',
            border: '1px solid rgba(62,207,142,0.2)',
          }}>
            <span className="live-dot" style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Live
            </span>
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '-0.005em' }}>
          Real-time pipeline intelligence — Reyes Music × Raleigh MG
        </p>
      </div>

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard
          label="Total Leads"
          value={mockStats.totalLeads}
          sub="in pipeline"
          accent="gold"
          live
        />
        <StatCard
          label="High Priority"
          value={mockStats.highPriority}
          sub="ready for outreach"
          accent="red"
        />
        <StatCard
          label="Emails Sent"
          value={mockStats.emailsSent}
          sub={`${mockStats.openRate}% open rate`}
          accent="blue"
        />
        <StatCard
          label="Est. Annual"
          value={`$${(mockStats.estimatedAnnualRoyalties / 1000).toFixed(0)}K`}
          sub="uncollected royalties"
          accent="green"
        />
      </div>

      {/* ── Main Grid ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, marginBottom: 14 }}>

        {/* Top Leads Table */}
        <Panel
          title="Top Leads"
          badge={highPriority.length}
          noPad
          action={<ActionBtn size="sm" variant="ghost">View All</ActionBtn>}
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Writer</th>
                  <th>Score</th>
                  <th>Streams</th>
                  <th>Royalties</th>
                  <th>Publisher</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {highPriority.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13, letterSpacing: '-0.01em' }}>
                        {p.writer_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 2 }}>
                        {p.associated_artists.slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td><ScoreBadge score={p.ai_score} /></td>
                    <td><Streams value={p.spotify_streams} /></td>
                    <td>
                      {p.estimated_monthly_royalties ? (
                        <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                          ${p.estimated_monthly_royalties.toLocaleString()}/mo
                        </span>
                      ) : <span style={{ color: 'var(--text-disabled)' }}>—</span>}
                    </td>
                    <td><StatusBadge status={p.publisher_status} /></td>
                    <td><StatusBadge status={p.outreach_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Pipeline Stats */}
          <Panel
            title="Pipeline"
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="live-dot" style={{ width: 5, height: 5, background: 'var(--green)', borderRadius: '50%' }} />
                <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Live</span>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { label: 'Songs Scanned', value: mockStats.songsScanned, max: 1000, color: 'var(--gold)' },
                { label: 'Leads Found',   value: mockStats.totalLeads,   max: 200,  color: 'var(--blue)' },
                { label: 'Emails Sent',   value: mockStats.emailsSent,   max: 50,   color: 'var(--green)' },
                { label: 'Signed',        value: mockStats.producersSigned, max: 10, color: 'var(--green)' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Quick Actions */}
          <Panel title="Quick Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ActionBtn variant="gold" style={{ width: '100%' }}>
                ▶ Run Scan — Lil Durk
              </ActionBtn>
              <ActionBtn variant="green" style={{ width: '100%' }}>
                ✓ Approve Top Emails
              </ActionBtn>
              <ActionBtn variant="ghost" style={{ width: '100%' }}>
                ↗ Open Scan Engine
              </ActionBtn>
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
                <td style={{ fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {job.artist_name}
                </td>
                <td><StatusBadge status={job.status} /></td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{job.songs_scanned}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{job.writers_found}</td>
                <td>
                  <span style={{
                    color: job.leads_found > 0 ? 'var(--green)' : 'var(--text-muted)',
                    fontWeight: job.leads_found > 0 ? 600 : 400,
                    fontVariantNumeric: 'tabular-nums',
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
