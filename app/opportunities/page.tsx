'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Panel, StatusBadge, ScoreBadge, Streams, ActionBtn } from '@/components/ui'
import { mockProducers } from '@/lib/mock-data'

const targetArtists = [
  { name: 'Lil Durk', genre: 'Drill', streams: '8.2B', scanned: true },
  { name: 'Polo G', genre: 'Drill', streams: '4.1B', scanned: true },
  { name: 'Rod Wave', genre: 'Soul Trap', streams: '5.3B', scanned: false },
  { name: 'NBA YoungBoy', genre: 'Trap', streams: '12.1B', scanned: true },
  { name: 'Moneybagg Yo', genre: 'Trap', streams: '3.8B', scanned: false },
  { name: 'EST Gee', genre: 'Drill', streams: '1.2B', scanned: false },
  { name: 'Fivio Foreign', genre: 'Brooklyn Drill', streams: '2.1B', scanned: false },
  { name: 'Sleepy Hallow', genre: 'Brooklyn Drill', streams: '1.8B', scanned: false },
  { name: '42 Dugg', genre: 'Detroit Rap', streams: '1.4B', scanned: true },
  { name: 'Future', genre: 'Trap', streams: '9.7B', scanned: false },
  { name: '21 Savage', genre: 'Trap', streams: '7.2B', scanned: false },
  { name: 'Lil Baby', genre: 'Trap', streams: '10.4B', scanned: false },
  { name: 'Gunna', genre: 'Trap', streams: '5.6B', scanned: false },
  { name: 'Roddy Ricch', genre: 'West Coast', streams: '3.9B', scanned: false },
]

const mockBeatQueue = [
  { id: '1', title: 'Dark Bounce 140', genre: 'Drill', bpm: 140, key: 'Cm', aiScore: 92, targetArtist: 'Lil Durk', status: 'QUEUED' },
  { id: '2', title: 'Melodic Trap 144', genre: 'Soul Trap', bpm: 144, key: 'Am', aiScore: 88, targetArtist: 'Rod Wave', status: 'QUEUED' },
  { id: '3', title: 'Brooklyn Drill 130', genre: 'Brooklyn Drill', bpm: 130, key: 'Gm', aiScore: 85, targetArtist: 'Fivio Foreign', status: 'MATCHED' },
  { id: '4', title: 'Slimeball Drip 138', genre: 'Trap', bpm: 138, key: 'Fm', aiScore: 79, targetArtist: 'Future', status: 'QUEUED' },
]

const packGenres = ['All Genres', 'Drill', 'Trap', 'Soul Trap', 'Brooklyn Drill']

export default function OpportunitiesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'artists' | 'beats' | 'packs'>('artists')
  const [beatStatuses, setBeatStatuses] = useState<Record<string, string>>(
    Object.fromEntries(mockBeatQueue.map(b => [b.id, b.status]))
  )
  const [packArtist, setPackArtist] = useState(targetArtists[0].name)
  const [packGenre, setPackGenre] = useState('All Genres')
  const [packResults, setPackResults] = useState<typeof mockBeatQueue | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const highValueLeads = mockProducers
    .filter(p => p.publisher_status === 'NO_PUBLISHER' && (p.ai_score || 0) >= 70)
    .sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0))

  const handleRoutebeat = (beatId: string, targetArtist: string) => {
    setBeatStatuses(prev => ({ ...prev, [beatId]: 'MATCHED' }))
    showToast(`✓ Beat routed to ${targetArtist}`)
  }

  const handleGeneratePack = () => {
    const filtered = mockBeatQueue.filter(b =>
      packGenre === 'All Genres' || b.genre === packGenre
    ).slice(0, 3)
    setPackResults(filtered)
    showToast(`✓ Generated ${filtered.length} AI-matched beats for ${packArtist}`)
  }

  return (
    <div style={{ padding: 32, maxWidth: 1400 }}>

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

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.02em', marginBottom: 6 }}>Opportunities</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Beat routing, artist targeting, and pipeline matching</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', width: 'fit-content' }}>
        {(['artists', 'beats', 'packs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              background: activeTab === tab ? 'rgba(201,168,76,0.15)' : 'transparent',
              color: activeTab === tab ? '#C9A84C' : 'var(--text-secondary)',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'artists' ? 'Target Artists' : tab === 'beats' ? 'Beat Queue' : 'Pack Builder'}
          </button>
        ))}
      </div>

      {activeTab === 'artists' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
          <Panel title="Target Artist Watchlist" badge={targetArtists.length}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {targetArtists.map(artist => (
                <div
                  key={artist.name}
                  className="glass-card"
                  style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{artist.name}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 20 }}>{artist.genre}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{artist.streams}</span>
                    </div>
                  </div>
                  <div>
                    {artist.scanned ? (
                      <span style={{ fontSize: 11, color: '#4CAF82', fontWeight: 600 }}>✓ Scanned</span>
                    ) : (
                      <ActionBtn size="sm" variant="gold" onClick={() => router.push(`/scan?artist=${encodeURIComponent(artist.name)}`)}>
                        Scan
                      </ActionBtn>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Top Unmatched Leads" badge={highValueLeads.length}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {highValueLeads.map(p => (
                <div
                  key={p.id}
                  className="glass-card"
                  style={{ padding: '14px 16px', cursor: 'pointer' }}
                  onClick={() => router.push('/producers')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{p.writer_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.top_song} · {p.associated_artists[0]}</div>
                    </div>
                    <ScoreBadge score={p.ai_score} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: '#4CAF82', fontWeight: 700 }}>${p.estimated_monthly_royalties?.toLocaleString()}/mo</div>
                    <StatusBadge status={p.outreach_status} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'beats' && (
        <Panel title="Beat Queue" badge={mockBeatQueue.length}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Beat Title</th><th>Genre</th><th>BPM</th><th>Key</th>
                <th>AI Match Score</th><th>Target Artist</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {mockBeatQueue.map(beat => (
                <tr key={beat.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{beat.title}</td>
                  <td>{beat.genre}</td>
                  <td>{beat.bpm} BPM</td>
                  <td>{beat.key}</td>
                  <td><ScoreBadge score={beat.aiScore} /></td>
                  <td>{beat.targetArtist}</td>
                  <td>
                    <StatusBadge status={beatStatuses[beat.id] === 'MATCHED' ? 'APPROVED' : 'PENDING'} />
                  </td>
                  <td>
                    {beatStatuses[beat.id] === 'MATCHED' ? (
                      <span style={{ fontSize: 11, color: '#4CAF82', fontWeight: 600 }}>✓ Routed</span>
                    ) : (
                      <ActionBtn size="sm" variant="gold" onClick={() => handleRoutebeat(beat.id, beat.targetArtist)}>
                        Route
                      </ActionBtn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {activeTab === 'packs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Panel title="Build a Beat Pack">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>TARGET ARTIST</label>
                <select
                  value={packArtist}
                  onChange={e => setPackArtist(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
                >
                  {targetArtists.map(a => <option key={a.name}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>GENRE FILTER</label>
                <select
                  value={packGenre}
                  onChange={e => setPackGenre(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
                >
                  {packGenres.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <ActionBtn variant="gold" onClick={handleGeneratePack}>Generate Pack with AI</ActionBtn>
            </div>
          </Panel>
          <Panel title="AI Match Results">
            {packResults === null ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Select an artist and genre to generate AI-matched beat pack suggestions
              </div>
            ) : packResults.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No beats match that genre filter
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.07em', marginBottom: 4 }}>
                  {packResults.length} BEATS MATCHED FOR {packArtist.toUpperCase()}
                </div>
                {packResults.map(beat => (
                  <div key={beat.id} className="glass-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{beat.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{beat.genre} · {beat.bpm} BPM · {beat.key}</div>
                    </div>
                    <ScoreBadge score={beat.aiScore} />
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}
