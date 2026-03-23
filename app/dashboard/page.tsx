'use client'

import { StatCard, Panel, StatusBadge, ScoreBadge, Streams, ActionBtn } from '@/components/ui'
import { mockProducers, mockScanJobs, mockStats } from '@/lib/mock-data'

export default function DashboardPage() {
  const highPriority = mockProducers.filter(p => p.priority === 'HIGH')
  const recentJobs = mockScanJobs.slice(0, 4)

  return (
    <div style={{ padding: 32, maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.02em', marginBottom: 6 }}>
          Command Center
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Real-time pipeline intelligence — Reyes Music × Raleigh MG
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 20 }}>
        {/* Producer Table */}
        <Panel title="Top Leads" badge={highPriority.length} action={
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
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{p.writer_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {p.associated_artists.slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td><ScoreBadge score={p.ai_score} /></td>
                    <td><Streams value={p.spotify_streams} /></td>
                    <td>
                      {p.estimated_monthly_royalties && (
                        <span style={{ color: '#4CAF82', fontWeight: 700 }}>
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

        {/* Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Panel title="Pipeline Stats" action={
            <div className="flex items-center gap-1.5">
              <div className="live-dot rounded-full" style={{ width: 6, height: 6, background: '#4CAF82' }} />
              <span style={{ fontSize: 10, color: '#4CAF82', fontWeight: 600 }}>LIVE</span>
            </div>
          }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Songs Scanned', value: mockStats.songsScanned, max: 1000, color: '#C9A84C' },
                { label: 'Leads Found', value: mockStats.totalLeads, max: 200, color: '#5280E0' },
                { label: 'Emails Sent', value: mockStats.emailsSent, max: 50, color: '#4CAF82' },
                { label: 'Producers Signed', value: mockStats.producersSigned, max: 10, color: '#4CAF82' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.07)' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                      background: item.color,
                      borderRadius: 2,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Quick Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ActionBtn variant="gold" className="w-full">Run Scan — Lil Durk</ActionBtn>
              <ActionBtn variant="green" className="w-full">Approve Top Emails</ActionBtn>
              <ActionBtn variant="ghost" className="w-full">Schedule Weekly Scan</ActionBtn>
            </div>
          </Panel>
        </div>
      </div>

      {/* Scan Job History */}
      <Panel title="Scan Job History" badge={recentJobs.length}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Artist</th>
              <th>Status</th>
              <th>Songs Scanned</th>
              <th>Writers Found</th>
              <th>Leads Found</th>
              <th>Triggered By</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {recentJobs.map(job => (
              <tr key={job.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.artist_name}</td>
                <td><StatusBadge status={job.status} /></td>
                <td>{job.songs_scanned}</td>
                <td>{job.writers_found}</td>
                <td>
                  <span style={{ color: job.leads_found > 0 ? '#4CAF82' : 'var(--text-muted)', fontWeight: job.leads_found > 0 ? 700 : 400 }}>
                    {job.leads_found}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
