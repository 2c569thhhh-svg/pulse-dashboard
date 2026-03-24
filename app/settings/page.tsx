'use client'

import { useState, useEffect } from 'react'
import { Panel, ProgressBar, ActionBtn, StatusBadge } from '@/components/ui'
import { getStoredProducers, mergeProducers } from '@/lib/pipeline-store'
import { mockProducers } from '@/lib/mock-data'

const apiConnections = [
  { name: 'Soundcharts', status: 'CONNECTED', usage: 72, limit: '10K calls/mo', endpoint: 'customer.api.soundcharts.com', envKey: 'SOUNDCHARTS_API_TOKEN' },
  { name: 'Spotify', status: 'CONNECTED', usage: 18, limit: '100K calls/day', endpoint: 'api.spotify.com', envKey: 'SPOTIFY_CLIENT_ID' },
  { name: 'Supabase', status: 'CONNECTED', usage: 34, limit: '500MB storage', endpoint: 'supabase.co', envKey: 'NEXT_PUBLIC_SUPABASE_URL' },
  { name: 'Apify', status: 'CONNECTED', usage: 45, limit: '$49/mo plan', endpoint: 'api.apify.com', envKey: 'APIFY_TOKEN' },
  { name: 'Claude API', status: 'DISCONNECTED', usage: 0, limit: 'Not configured', endpoint: 'api.anthropic.com', envKey: 'ANTHROPIC_API_KEY' },
  { name: 'SendGrid', status: 'DISCONNECTED', usage: 0, limit: 'Not configured', endpoint: 'api.sendgrid.com', envKey: 'SENDGRID_API_KEY' },
]

const BASE_GENRES = ['Drill', 'Trap', 'Brooklyn Drill', 'Soul Trap', 'Detroit Rap', 'West Coast Rap', 'ATL Trap']

const BASE_ARTISTS = [
  'Lil Durk', 'Polo G', 'NBA YoungBoy', 'Moneybagg Yo', 'Rod Wave',
  'EST Gee', 'Fivio Foreign', 'Sleepy Hallow', '42 Dugg', 'Sheff G',
  'Gunna', 'Future', '21 Savage', 'Lil Baby', 'Roddy Ricch',
]

const CONFIG_KEY = 'pulse_config'

function loadConfig() {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null') } catch { return null }
}

export default function SettingsPage() {
  const [scanFrequency, setScanFrequency] = useState('weekly')
  const [minStreams, setMinStreams] = useState('500000')
  const [minScore, setMinScore] = useState('60')
  const [selectedGenres, setSelectedGenres] = useState(['Drill', 'Trap', 'Brooklyn Drill'])
  const [watchlist, setWatchlist] = useState(BASE_ARTISTS)
  const [newArtist, setNewArtist] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [configApiUrl, setConfigApiUrl] = useState<Record<string, string>>({})
  const [showApiInput, setShowApiInput] = useState<string | null>(null)
  const [apiInputValue, setApiInputValue] = useState('')

  useEffect(() => {
    const cfg = loadConfig()
    if (cfg) {
      if (cfg.scanFrequency) setScanFrequency(cfg.scanFrequency)
      if (cfg.minStreams) setMinStreams(cfg.minStreams)
      if (cfg.minScore) setMinScore(cfg.minScore)
      if (cfg.selectedGenres) setSelectedGenres(cfg.selectedGenres)
      if (cfg.watchlist) setWatchlist(cfg.watchlist)
      if (cfg.apiNotes) setConfigApiUrl(cfg.apiNotes)
    }
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const handleSaveConfig = () => {
    const cfg = { scanFrequency, minStreams, minScore, selectedGenres, watchlist, apiNotes: configApiUrl }
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
    showToast('✓ Configuration saved')
  }

  const handleAddArtist = () => {
    const name = newArtist.trim()
    if (!name || watchlist.includes(name)) return
    const updated = [...watchlist, name]
    setWatchlist(updated)
    setNewArtist('')
    showToast(`✓ Added ${name} to watchlist`)
  }

  const handleRemoveArtist = (name: string) => {
    setWatchlist(prev => prev.filter(a => a !== name))
  }

  const handleClearSkipped = () => {
    const stored = getStoredProducers()
    const cleared = stored.filter(p => p.outreach_status !== 'SKIPPED')
    localStorage.setItem('pulse_producers', JSON.stringify(cleared))
    showToast(`✓ Cleared skipped leads`)
  }

  const handleExportCSV = () => {
    const producers = mergeProducers(mockProducers, getStoredProducers())
    const headers = ['Name', 'IPI', 'PRO', 'Publisher Status', 'Outreach Status', 'AI Score', 'Est. Monthly ($)', 'Streams', 'Top Song', 'Artists', 'Email', 'Instagram']
    const rows = producers.map(p => [
      p.writer_name,
      p.ipi_number || '',
      p.pro || '',
      p.publisher_status,
      p.outreach_status,
      p.ai_score ?? '',
      p.estimated_monthly_royalties ?? '',
      p.spotify_streams ?? '',
      p.top_song || '',
      p.associated_artists.join('; '),
      p.email || '',
      p.instagram || '',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pulse-leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`✓ Exported ${producers.length} producers to CSV`)
  }

  const handleRunPipeline = () => {
    window.location.href = '/scan'
  }

  const handleConfigureAPI = (apiName: string) => {
    setShowApiInput(apiName)
    setApiInputValue(configApiUrl[apiName] || '')
  }

  const handleSaveApiNote = () => {
    if (!showApiInput) return
    const updated = { ...configApiUrl, [showApiInput]: apiInputValue }
    setConfigApiUrl(updated)
    setShowApiInput(null)
    showToast(`✓ Note saved for ${showApiInput} — set actual keys in Vercel env vars`)
  }

  return (
    <div style={{ padding: 32, maxWidth: 1000 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: 'rgba(20,20,28,0.97)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '12px 20px', fontSize: 13,
          color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}

      {/* API key modal */}
      {showApiInput && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, width: 460 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Configure {showApiInput}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
              API keys must be set as environment variables in your Vercel project (Settings → Environment Variables). Add your key there, then redeploy.
            </p>
            <div style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: 'var(--gold)' }}>
              <strong>Vercel → {`{project}`} → Settings → Environment Variables</strong>
            </div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Notes / Credential Reference
            </label>
            <input
              value={apiInputValue}
              onChange={e => setApiInputValue(e.target.value)}
              placeholder="e.g. stored in 1Password under Pulse Keys"
              style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <ActionBtn variant="ghost" onClick={() => setShowApiInput(null)}>Cancel</ActionBtn>
              <ActionBtn variant="gold" onClick={handleSaveApiNote}>Save Note</ActionBtn>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.02em', marginBottom: 6 }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>API connections, scan configuration, and pipeline controls</p>
      </div>

      {/* API Connections */}
      <Panel title="API Connections" className="mb-6">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {apiConnections.map((api, i) => (
            <div
              key={api.name}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom: i < apiConnections.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{api.name}</span>
                  <StatusBadge status={api.status === 'CONNECTED' ? 'COMPLETED' : 'FAILED'} />
                  {configApiUrl[api.name] && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>note saved</span>
                  )}
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
              <ActionBtn size="sm" variant={api.status === 'CONNECTED' ? 'ghost' : 'gold'} onClick={() => handleConfigureAPI(api.name)}>
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
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>SCAN FREQUENCY</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['daily', 'weekly', 'manual'].map(freq => (
                  <button
                    key={freq}
                    onClick={() => setScanFrequency(freq)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8, border: '1px solid',
                      borderColor: scanFrequency === freq ? 'rgba(201,168,76,0.4)' : 'var(--border)',
                      background: scanFrequency === freq ? 'rgba(201,168,76,0.1)' : 'transparent',
                      color: scanFrequency === freq ? '#C9A84C' : 'var(--text-secondary)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
                    }}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>MIN STREAMS THRESHOLD</label>
              <input
                value={minStreams}
                onChange={e => setMinStreams(e.target.value)}
                type="number"
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Only flag songs with {parseInt(minStreams || '0').toLocaleString()}+ streams
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>MIN AI SCORE</label>
              <input
                value={minScore}
                onChange={e => setMinScore(e.target.value)}
                type="number" min="0" max="100"
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }}
              />
            </div>
            <ActionBtn variant="gold" onClick={handleSaveConfig}>Save Configuration</ActionBtn>
          </div>
        </Panel>

        <Panel title="Genre Filters">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {BASE_GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                style={{
                  padding: '7px 14px', borderRadius: 20, border: '1px solid',
                  borderColor: selectedGenres.includes(genre) ? 'rgba(201,168,76,0.4)' : 'var(--border)',
                  background: selectedGenres.includes(genre) ? 'rgba(201,168,76,0.12)' : 'transparent',
                  color: selectedGenres.includes(genre) ? '#C9A84C' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                {genre}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedGenres.length} genres selected</div>
        </Panel>
      </div>

      {/* Target Artists Watchlist */}
      <Panel title="Target Artist Watchlist" badge={watchlist.length}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {watchlist.map(artist => (
            <span
              key={artist}
              style={{
                background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)',
                fontSize: 13, padding: '6px 14px', borderRadius: 20,
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {artist}
              <button
                onClick={() => handleRemoveArtist(artist)}
                style={{ background: 'none', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={newArtist}
            onChange={e => setNewArtist(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddArtist()}
            placeholder="Add artist name..."
            style={{
              flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 14px', color: 'var(--text-primary)',
              fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none',
            }}
          />
          <ActionBtn size="sm" variant="ghost" onClick={handleAddArtist} disabled={!newArtist.trim()}>
            + Add Artist
          </ActionBtn>
        </div>
      </Panel>

      {/* Pipeline Controls */}
      <div style={{ marginTop: 20 }}>
        <Panel title="Pipeline Controls">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Run Full Pipeline</div>
              <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginBottom: 12 }}>Scan all watchlist artists</div>
              <ActionBtn variant="gold" onClick={handleRunPipeline}>Run Now</ActionBtn>
            </div>
            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Clear Skipped Leads</div>
              <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginBottom: 12 }}>Remove all skipped entries</div>
              <ActionBtn variant="ghost" onClick={handleClearSkipped}>Clear</ActionBtn>
            </div>
            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Export All Leads</div>
              <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginBottom: 12 }}>Download as CSV</div>
              <ActionBtn variant="ghost" onClick={handleExportCSV}>Export CSV</ActionBtn>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
