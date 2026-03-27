'use client'

import { StatCard, Panel, StatusBadge, ScoreBadge, Streams, ActionBtn } from '@/components/ui'
import { IridescentOrb } from '@/components/ui/IridescentOrb'
import { mockProducers, mockScanJobs, mockStats } from '@/lib/mock-data'

export default function DashboardPage() {
  const highPriority = mockProducers.filter(p => p.priority === 'HIGH')
  const recentJobs = mockScanJobs.slice(0, 4)

  return (
    <div
      style={{
        padding: '32px 36px',
        maxWidth: 1440,
        minHeight: '100vh',
      }}
    >

      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 7,
            }}
          >
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: 'rgba(255, 255, 255, 0.96)',
                lineHeight: 1,
              }}
            >
              Command Center
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 99,
                background: 'rgba(62, 207, 142, 0.08)',
                border: '1px solid rgba(62, 207, 142, 0.2)',
              }}
            >
              <span
                className="live-dot"
                style={{
                  display: 'block',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'var(--green)',
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--green)',
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                }}
              >
                Live
              </span>
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            Real-time pipeline intelligence — Reyes Music × Raleigh MG
          </p>
        </div>

        {/* Date chip */}
        <div
          style={{
            padding: '7px 16px',
            borderRadius: 9,
            background: 'rgba(255, 255, 255, 0.035)',
            border: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            alignSelf: 'center',
          }}
        >
          {new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          marginBottom: 20,
        }}
      >
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

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 368px',
          gap: 16,
          marginBottom: 16,
        }}
      >

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
                      <div
                        style={{
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          fontSize: 13,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {p.writer_name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-disabled)',
                          marginTop: 2,
                        }}
                      >
                        {p.associated_artists.slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td><ScoreBadge score={p.ai_score} /></td>
                    <td><Streams value={p.spotify_streams} /></td>
                    <td>
                      {p.estimated_monthly_royalties ? (
                        <span
                          style={{
                            color: 'var(--green)',
                            fontWeight: 600,
                            fontSize: 13,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          ${p.estimated_monthly_royalties.toLocaleString()}/mo
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-disabled)' }}>—</span>
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

          {/* ── Iridescent Orb Card ─────────────────────────────── */}
          <div
            className="glow-card glow-card-purple"
            style={{
              padding: '36px 24px 30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(155, 126, 248, 0.028)',
              borderColor: 'rgba(155, 126, 248, 0.12)',
            }}
          >
            {/* Top label row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: 28,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Producer Database
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginTop: 2,
                  }}
                >
                  Live sync active
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  className="live-dot"
                  style={{
                    width: 5,
                    height: 5,
                    background: 'rgba(155, 126, 248, 0.9)',
                    borderRadius: '50%',
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'rgba(155, 126, 248, 0.8)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Indexed
                </span>
              </div>
            </div>

            <IridescentOrb
              producerCount={mockStats.totalLeads + 2705}
              label="Producer Database"
              sublabel="indexed writers"
            />

            {/* Mini stats row below orb */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 10,
                width: '100%',
                marginTop: 28,
                paddingTop: 20,
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {[
                { label: 'Scanned', value: mockStats.songsScanned.toLocaleString() },
                { label: 'Leads', value: mockStats.totalLeads.toLocaleString() },
                { label: 'Signed', value: mockStats.producersSigned.toLocaleString() },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      marginTop: 4,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Progress */}
          <Panel
            title="Pipeline"
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  className="live-dot"
                  style={{
                    width: 5,
                    height: 5,
                    background: 'var(--green)',
                    borderRadius: '50%',
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--green)',
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                  }}
                >
                  Live
                </span>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                {
                  label: 'Songs Scanned',
                  value: mockStats.songsScanned,
                  max: 1000,
                  color: 'var(--gold)',
                },
                {
                  label: 'Leads Found',
                  value: mockStats.totalLeads,
                  max: 200,
                  color: 'var(--blue)',
                },
                {
                  label: 'Emails Sent',
                  value: mockStats.emailsSent,
                  max: 50,
                  color: 'var(--green)',
                },
                {
                  label: 'Signed',
                  value: mockStats.producersSigned,
                  max: 10,
                  color: 'var(--green)',
                },
              ].map(item => (
                <div key={item.label}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Quick Actions */}
          <Panel title="Quick Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <ActionBtn variant="gold" className="w-full">
                ▶ Run Scan — Lil Durk
              </ActionBtn>
              <ActionBtn variant="green" className="w-full">
                ✓ Approve Top Emails
              </ActionBtn>
              <ActionBtn variant="ghost" className="w-full">
                ↗ Open Scan Engine
              </ActionBtn>
            </div>
          </Panel>
        </div>
      </div>

      {/* ── Recent Scans ───────────────────────────────────────── */}
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
                <td
                  style={{
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {job.artist_name}
                </td>
                <td><StatusBadge status={job.status} /></td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{job.songs_scanned}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{job.writers_found}</td>
                <td>
                  <span
                    style={{
                      color: job.leads_found > 0 ? 'var(--green)' : 'var(--text-muted)',
                      fontWeight: job.leads_found > 0 ? 600 : 400,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {job.leads_found}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
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
