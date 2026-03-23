'use client'

import { StatCard, Panel, StatusBadge, ScoreBadge, Streams, ActionBtn } from '@/components/ui'
import { mockProducers, mockScanJobs, mockStats } from '@/lib/mock-data'

export default function DashboardPage() {
  const highPriority = mockProducers.filter(p => p.priority === 'HIGH')
  const recentJobs = mockScanJobs.slice(0, 4)

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Command Center
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, background: 'rgba(76,175,130,0.1)', border: '1px solid rgba(76,175,130,0.2)' }}>
            <div className="live-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#4CAF82' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#4CAF82', letterSpacing: '0.06em' }}>LIVE</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '-0.01em' }}>
          Real-time pipeline intelligence — Reyes Music × Raleigh MG
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Leads" value={mockStats.totalLeads} sub="in pipeline" accent="gold" live />
        <StatCard label="High Priority" value={mockStats.highPriority} sub="ready for outreach" accent="red" />
        <StatCard label="Emails Sent" value={mockStats.emailsSent} sub={`${mockStats.openRate}% open rate`} accent="blue" />
        <StatCard label="Est. Annual" value={`$${(mockStats.estimatedAnnualRoyalties / 1000).toFixed(0)}K`} sub="uncollected royalties" accent="green" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, marginBottom: 16 }}>
        {/* Top Leads Table */}
        <Panel title="Top Leads" badge={highPriority.length} noPad action={
          <ActionBtn size="sm" variant="ghost">View All</ActionBtn>
        }>
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
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13, letterSpacing: '-0.01em' }}>
                        {p.writer_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {p.associated_artists.slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td><ScoreBadge score={p.ai_score} /></td>
                    <td><Streams value={p.spotify_streams} /></td>
                    <td>
                      {p.estimated_monthly_royalties && (
                        <span style={{ color: '#4CAF82', fontWeight: 600, fontSize: 13 }}>
                          ${p.estimated_monthly_royalties.toLocaleString()}/mo
                        </span>
                      )}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Pipeline Stats */}
          <Panel title="Pipeline Stats" action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="live-dot" style={{ width: 5, height: 5, background: '#4CAF82', borderRadius: '50%' }} />
              <span style={{ fontSize: 10, color: '#4CAF82', fontWeight: 600, letterSpacing: '0.06em' }}>LIVE</span>
            </div>
          }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Songs Scanned', value: mockStats.songsScanned, max: 1000, color: '#C9A84C' },
                { label: 'Leads Found',   value: mockStats.totalLeads,   max: 200,  color: '#5280E0' },
                { label: 'Emails Sent',   value: mockStats.emailsSent,   max: 50,   color: '#4CAF82' },
                { label: 'Signed',        value: mockStats.producersSigned, max: 10, color: '#4CAF82' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 400 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{
                      width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                      background: item.color,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Quick Actions */}
          <Panel title="Quick Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <ActionBtn variant="gold" className="w-full" style={{ width: '100%' }}>
                ▶ Run Scan — Lil Durk
              </ActionBtn>
              <ActionBtn variant="green" className="w-full" style={{ width: '100%' }}>
                ✓ Approve Top Emails
              </ActionBtn>
              <ActionBtn variant="ghost" className="w-full" style={{ width: '100%' }}>
                ↗ Open Scan Engine
              </ActionBtn>
            </div>
          </Panel>
        </div>
      </div>

      {/* Scan Job History */}
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
                <td style={{ fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {job.artist_name}
                </td>
                <td><StatusBadge status={job.status} /></td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{job.songs_scanned}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{job.writers_found}</td>
                <td>
                  <span style={{
                    color: job.leads_found > 0 ? '#4CAF82' : 'var(--text-muted)',
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
