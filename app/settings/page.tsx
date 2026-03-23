'use client'

import { useState } from 'react'
import { Panel, ProgressBar, ActionBtn, StatusBadge } from '@/components/ui'

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
    </div>
  )
}
