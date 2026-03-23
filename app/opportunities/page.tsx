'use client'

import { useState } from 'react'
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

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<'artists' | 'beats' | 'packs'>('artists')

  const highValueLeads = mockProducers
    .filter(p => p.publisher_status === 'NO_PUBLISHER' && (p.ai_score || 0) >= 70)
    .sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0))

  return (
    <div style={{ padding: 32, maxWidth: 1400 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.02em', marginBottom: 6 }}>
          Opportunities
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Beat routing, artist targeting, and pipeline matching
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', width: 'fit-content' }}>
        {(['artists', 'beats', 'packs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Syne, sans-serif',
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
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {artist.name}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 20 }}>
                        {artist.genre}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{artist.streams}</span>
                    </div>
                  </div>
                  <div>
                    {artist.scanned ? (
                      <span style={{ fontSize: 11, color: '#4CAF82', fontWeight: 600 }}>✓ Scanned</span>
                    ) : (
                      <ActionBtn size="sm" variant="gold">Scan</ActionBtn>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Top Unmatched Leads" badge={highValueLeads.length}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {highValueLeads.map(p => (
                <div key={p.id} className="glass-card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {p.writer_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {p.top_song} · {p.associated_artists[0]}
                      </div>
                    </div>
                    <ScoreBadge score={p.ai_score} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: '#4CAF82', fontWeight: 700 }}>
                      ${p.estimated_monthly_royalties?.toLocaleString()}/mo
                    </div>
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
                <th>Beat Title</th>
                <th>Genre</th>
                <th>BPM</th>
                <th>Key</th>
                <th>AI Match Score</th>
                <th>Target Artist</th>
                <th>Status</th>
                <th></th>
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
                    <StatusBadge status={beat.status === 'MATCHED' ? 'APPROVED' : 'PENDING'} />
                  </td>
                  <td>
                    <ActionBtn size="sm" variant="gold">Route</ActionBtn>
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
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  TARGET ARTIST
                </label>
                <select style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Syne, sans-serif' }}>
                  {targetArtists.map(a => <option key={a.name}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  GENRE FILTER
                </label>
                <select style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Syne, sans-serif' }}>
                  <option>All Genres</option>
                  <option>Drill</option>
                  <option>Trap</option>
                  <option>Soul Trap</option>
                  <option>Brooklyn Drill</option>
                </select>
              </div>
              <ActionBtn variant="gold">Generate Pack with AI</ActionBtn>
            </div>
          </Panel>
          <Panel title="AI Match Results">
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Select an artist and genre to generate AI-matched beat pack suggestions
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
