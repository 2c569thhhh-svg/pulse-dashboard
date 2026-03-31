'use client'

import { useState } from 'react'
import { Panel, ProgressBar, ActionBtn, StatusBadge } from '@/components/ui'

// Mock competitor activity feed
const competitorFeed = [
  { id: 1, producer: 'Bankroll Got It', artist: 'Moneybagg Yo', publisher: 'ole', daysAgo: 3, genre: 'Memphis Rap' },
  { id: 2, producer: 'DJ Swift', artist: 'Rod Wave', publisher: 'Kobalt', daysAgo: 5, genre: 'Soul Trap' },
  { id: 3, producer: 'K-Swizz', artist: 'NBA YoungBoy', publisher: 'Warner Chappell', daysAgo: 8, genre: 'Baton Rouge Rap' },
  { id: 4, producer: 'TreGotBeats', artist: 'Lil Durk', publisher: 'ole', daysAgo: 11, genre: 'Chicago Drill' },
  { id: 5, producer: 'Pyrex Whippa', artist: 'Future', publisher: 'Sony Music Publishing', daysAgo: 14, genre: 'ATL Trap' },
]

// Mock accuracy reports log
const accuracyReports = [
  { id: 1, producer: 'Sample Beat', reportedAt: '2024-01-22T10:30:00Z', reason: 'IS_PUBLISHED', status: 'RESOLVED', resolution: 'Confirmed — removed from pipeline' },
  { id: 2, producer: 'Unnamed Producer #4', reportedAt: '2024-01-21T14:00:00Z', reason: 'WRONG_CONTACT', status: 'UNDER_REVIEW', resolution: null },
  { id: 3, producer: 'BeatsByX', reportedAt: '2024-01-20T09:00:00Z', reason: 'SELF_COLLECTING', status: 'RESOLVED', resolution: 'Verified — self-collecting entity confirmed' },
]

const apiConnections = [
  { name: 'Soundcharts', status: 'CONNECTED', usage: 72, limit: '10K calls/mo', endpoint: 'customer.api.soundcharts.com' },
  { name: 'Spotify', status: 'CONNECTED', usage: 18, limit: '100K calls/day', endpoint: 'api.spotify.com' },
  { name: 'Supabase', status: 'CONNECTED', usage: 34, limit: '500MB storage', endpoint: 'jqkuagazmahdfwagzvtx.supabase.co' },
  { name: 'Apify', status: 'CONNECTED', usage: 45, limit: '$49/mo plan', endpoint: 'api.apify.com' },
  { name: 'Claude API', status: 'DISCONNECTED', usage: 0, limit: 'Not configured', endpoint: 'api.anthropic.com' },
  { name: 'SendGrid', status: 'DISCONNECTED', usage: 0, limit: 'Not configured', endpoint: 'api.sendgrid.com' },
]

const targetArtists = [
  'Lil Durk', 'Polo G', 'NBA YoungBoy', 'Moneybagg Yo', 'Rod Wave',
  'EST Gee', 'Fivio Foreign', 'Sleepy Hallow', '42 Dugg', 'Sheff G',
  'Gunna', 'Future', '21 Savage', 'Lil Baby', 'Roddy Ricch',
]

export default function SettingsPage() {
  const [scanFrequency, setScanFrequency] = useState('weekly')
  const [minStreams, setMinStreams] = useState('500000')
  const [minScore, setMinScore] = useState('60')
  const [selectedGenres, setSelectedGenres] = useState(['Drill', 'Trap', 'Brooklyn Drill'])
  const [competitorMonitoring, setCompetitorMonitoring] = useState(true)
  const [hotCatalogAlerts, setHotCatalogAlerts] = useState(true)

  const genres = ['Drill', 'Trap', 'Brooklyn Drill', 'Soul Trap', 'Detroit Rap', 'West Coast Rap', 'ATL Trap']

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 1000 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.02em', marginBottom: 6 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          API connections, scan configuration, and pipeline controls
        </p>
      </div>

      {/* API Connections */}
      <Panel title="API Connections" className="mb-6">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {apiConnections.map((api, i) => (
            <div
              key={api.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom: i < apiConnections.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{api.name}</span>
                  <StatusBadge status={api.status === 'CONNECTED' ? 'COMPLETED' : 'FAILED'} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{api.endpoint}</div>
              </div>

              <div style={{ width: 200, marginRight: 24 }}>
                {api.status === 'CONNECTED' ? (
                  <ProgressBar label={api.limit} value={api.usage} color={api.usage > 80 ? '#E05252' : '#C9A84C'} />
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{api.limit}</div>
                )}
              </div>

              <ActionBtn size="sm" variant={api.status === 'CONNECTED' ? 'ghost' : 'gold'}>
                {api.status === 'CONNECTED' ? 'Configure' : 'Connect'}
              </ActionBtn>
            </div>
          ))}
        </div>
      </Panel>

      {/* Scan Configuration */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Panel title="Scan Configuration">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                SCAN FREQUENCY
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['daily', 'weekly', 'manual'].map(freq => (
                  <button
                    key={freq}
                    onClick={() => setScanFrequency(freq)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 8,
                      border: '1px solid',
                      borderColor: scanFrequency === freq ? 'rgba(201,168,76,0.4)' : 'var(--border)',
                      background: scanFrequency === freq ? 'rgba(201,168,76,0.1)' : 'transparent',
                      color: scanFrequency === freq ? '#C9A84C' : 'var(--text-secondary)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Syne, sans-serif',
                      textTransform: 'capitalize',
                    }}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                MIN STREAMS THRESHOLD
              </label>
              <input
                value={minStreams}
                onChange={e => setMinStreams(e.target.value)}
                type="number"
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Syne, sans-serif', outline: 'none' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Only flag songs with {parseInt(minStreams).toLocaleString()}+ streams
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                MIN AI SCORE
              </label>
              <input
                value={minScore}
                onChange={e => setMinScore(e.target.value)}
                type="number"
                min="0"
                max="100"
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Syne, sans-serif', outline: 'none' }}
              />
            </div>

            <ActionBtn variant="gold">Save Configuration</ActionBtn>
          </div>
        </Panel>

        <Panel title="Genre Filters">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: selectedGenres.includes(genre) ? 'rgba(201,168,76,0.4)' : 'var(--border)',
                  background: selectedGenres.includes(genre) ? 'rgba(201,168,76,0.12)' : 'transparent',
                  color: selectedGenres.includes(genre) ? '#C9A84C' : 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Syne, sans-serif',
                }}
              >
                {genre}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {selectedGenres.length} genres selected
          </div>
        </Panel>
      </div>

      {/* Target Artists */}
      <Panel title="Target Artist Watchlist" badge={targetArtists.length}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {targetArtists.map(artist => (
            <span
              key={artist}
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid var(--border)',
              }}
            >
              {artist}
            </span>
          ))}
        </div>
        <ActionBtn size="sm" variant="ghost">+ Add Artist</ActionBtn>
      </Panel>

      {/* Pipeline Controls */}
      <div style={{ marginTop: 20 }}>
        <Panel title="Pipeline Controls">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Run Full Pipeline</div>
              <ActionBtn variant="gold">Run Now</ActionBtn>
            </div>
            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Clear Skipped Leads</div>
              <ActionBtn variant="ghost">Clear</ActionBtn>
            </div>
            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Export All Leads</div>
              <ActionBtn variant="ghost">Export CSV</ActionBtn>
            </div>
          </div>
        </Panel>
      </div>

      {/* Competitor Monitoring */}
      <div style={{ marginTop: 20 }}>
        <Panel title="Competitor Monitoring">
          {/* Hot Catalog Alert banner (shown when enabled) */}
          {competitorMonitoring && hotCatalogAlerts && (
            <div style={{
              background: 'rgba(201,168,76,0.07)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🔥</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginBottom: 4 }}>
                  Hot Catalog Alert — Monday, Mar 31
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  3 producers from NBA YoungBoy's catalog were signed by publishers this week. <strong style={{ color: 'var(--text-primary)' }}>2 unrepresented producers remain</strong> in this catalog — act now.
                </div>
                <div style={{ marginTop: 10 }}>
                  <ActionBtn size="sm" variant="gold">View Remaining Producers</ActionBtn>
                </div>
              </div>
            </div>
          )}

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {/* Main toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                  Competitor Monitoring
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Monitor PRO registration updates for new publisher assignments on watchlist catalogs
                </div>
              </div>
              <button
                onClick={() => setCompetitorMonitoring(v => !v)}
                style={{
                  width: 44, height: 24, borderRadius: 99, border: 'none',
                  background: competitorMonitoring ? 'rgba(201,168,76,0.7)' : 'rgba(255,255,255,0.12)',
                  cursor: 'pointer', position: 'relative', flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                  left: competitorMonitoring ? 23 : 3,
                }} />
              </button>
            </div>

            {/* Hot Catalog Alerts sub-toggle */}
            {competitorMonitoring && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingLeft: 16, borderLeft: '2px solid rgba(201,168,76,0.15)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>
                    Weekly Hot Catalog Alerts
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Every Monday — new publisher signings in your target catalogs
                  </div>
                </div>
                <button
                  onClick={() => setHotCatalogAlerts(v => !v)}
                  style={{
                    width: 38, height: 20, borderRadius: 99, border: 'none',
                    background: hotCatalogAlerts ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.1)',
                    cursor: 'pointer', position: 'relative', flexShrink: 0,
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s',
                    left: hotCatalogAlerts ? 20 : 2,
                  }} />
                </button>
              </div>
            )}
          </div>

          {/* Competitor Activity Feed */}
          {competitorMonitoring && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Competitor Activity Feed
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {competitorFeed.map((item, i) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 0',
                      borderBottom: i < competitorFeed.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                        <strong>{item.producer}</strong>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> collab producer — </span>
                        <span style={{ color: '#E05252', fontWeight: 600 }}>signed to {item.publisher}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {item.artist} · {item.genre}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 12 }}>
                      {item.daysAgo} day{item.daysAgo !== 1 ? 's' : ''} ago
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Accuracy Reports */}
      <div style={{ marginTop: 20 }}>
        <Panel title="Accuracy Reports" badge={accuracyReports.filter(r => r.status === 'UNDER_REVIEW').length || undefined}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              User-submitted data accuracy reports. Leads under review are automatically removed from the active outreach queue.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {accuracyReports.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < accuracyReports.length - 1 ? '1px solid var(--border)' : 'none',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                    {r.producer}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Reason: {r.reason === 'IS_PUBLISHED' ? 'Writer IS published' :
                             r.reason === 'SELF_COLLECTING' ? 'Self-collecting entity' :
                             r.reason === 'WRONG_CONTACT' ? 'Wrong contact info' : 'Other'}
                    {' · '}{new Date(r.reportedAt).toLocaleDateString()}
                  </div>
                  {r.resolution && (
                    <div style={{ fontSize: 11, color: '#4CAF82' }}>{r.resolution}</div>
                  )}
                </div>
                <StatusBadge status={r.status === 'UNDER_REVIEW' ? 'PENDING' : 'COMPLETED'} />
              </div>
            ))}
          </div>
          {accuracyReports.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>
              No accuracy reports submitted yet
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
