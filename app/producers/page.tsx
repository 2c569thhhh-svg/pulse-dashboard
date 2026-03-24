'use client'

import { useState } from 'react'
import { Panel, StatusBadge, ScoreBadge, Streams, ActionBtn } from '@/components/ui'
import { mockProducers } from '@/lib/mock-data'
import type { Producer } from '@/types/database'

export default function ProducersPage() {
  const [search, setSearch] = useState('')
  const [filterPublisher, setFilterPublisher] = useState('ALL')
  const [filterOutreach, setFilterOutreach] = useState('ALL')
  const [selected, setSelected] = useState<Producer | null>(null)

  const filtered = mockProducers.filter(p => {
    const matchSearch = !search ||
      p.writer_name.toLowerCase().includes(search.toLowerCase()) ||
      p.associated_artists.some(a => a.toLowerCase().includes(search.toLowerCase())) ||
      (p.top_song || '').toLowerCase().includes(search.toLowerCase())
    const matchPub = filterPublisher === 'ALL' || p.publisher_status === filterPublisher
    const matchOut = filterOutreach === 'ALL' || p.outreach_status === filterOutreach
    return matchSearch && matchPub && matchOut
  })

  return (
    <div style={{ padding: 32, maxWidth: 1400 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.02em', marginBottom: 6 }}>
          Producer Database
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {mockProducers.length} producers in pipeline · {mockProducers.filter(p => p.publisher_status === 'NO_PUBLISHER').length} with no publisher
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, artist, or song..."
          style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 16px',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
          }}
        />
        <select
          value={filterPublisher}
          onChange={e => setFilterPublisher(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 16px',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
          }}
        >
          <option value="ALL">All Publishers</option>
          <option value="NO_PUBLISHER">No Publisher</option>
          <option value="SELF_PUBLISHED">Self-Published</option>
          <option value="INDIE">Indie</option>
          <option value="MAJOR">Major</option>
        </select>
        <select
          value={filterOutreach}
          onChange={e => setFilterOutreach(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 16px',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="SENT">Sent</option>
          <option value="OPENED">Opened</option>
          <option value="REPLIED">Replied</option>
          <option value="SIGNED">Signed</option>
          <option value="SKIPPED">Skipped</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* Table */}
        <Panel title="Producers" badge={filtered.length}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Writer</th>
                  <th>Top Song</th>
                  <th>Score</th>
                  <th>Streams</th>
                  <th>Royalties/mo</th>
                  <th>Publisher</th>
                  <th>Outreach</th>
                  <th>Contact</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    style={{
                      cursor: 'pointer',
                      background: selected?.id === p.id ? 'rgba(201,168,76,0.06)' : undefined,
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                        {p.writer_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {p.pro} · IPI {p.ipi_number}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p.top_song || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {p.associated_artists.slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td><ScoreBadge score={p.ai_score} /></td>
                    <td><Streams value={p.spotify_streams} /></td>
                    <td>
                      {p.estimated_monthly_royalties ? (
                        <span style={{ color: '#4CAF82', fontWeight: 700 }}>
                          ${p.estimated_monthly_royalties.toLocaleString()}
                        </span>
                      ) : '—'}
                    </td>
                    <td><StatusBadge status={p.publisher_status} /></td>
                    <td><StatusBadge status={p.outreach_status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {p.email && (
                          <span style={{ fontSize: 10, color: '#4CAF82', fontWeight: 600 }}>EMAIL</span>
                        )}
                        {p.instagram && (
                          <span style={{ fontSize: 10, color: '#C9A84C', fontWeight: 600 }}>IG</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <ActionBtn size="sm" variant="green" onClick={e => { e?.stopPropagation() }}>
                          Approve
                        </ActionBtn>
                        <ActionBtn size="sm" variant="ghost" onClick={e => { e?.stopPropagation() }}>
                          Skip
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                No producers match your filters
              </div>
            )}
          </div>
        </Panel>

        {/* Detail Panel */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Panel>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{selected.writer_name}</h2>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    IPI: {selected.ipi_number} · {selected.pro}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>AI Score</div>
                  <ScoreBadge score={selected.ai_score} />
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Monthly</div>
                  <div style={{ color: '#4CAF82', fontWeight: 700 }}>
                    ${selected.estimated_monthly_royalties?.toLocaleString() || '—'}
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Streams</div>
                  <Streams value={selected.spotify_streams} />
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Catalog</div>
                  <div style={{ fontWeight: 700 }}>{selected.catalog_count} songs</div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Associated Artists
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selected.associated_artists.map(a => (
                    <span key={a} style={{
                      background: 'rgba(255,255,255,0.07)',
                      color: 'var(--text-secondary)',
                      fontSize: 12,
                      padding: '3px 10px',
                      borderRadius: 20,
                    }}>{a}</span>
                  ))}
                </div>
              </div>

              {selected.reasoning && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    AI Analysis
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {selected.reasoning}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Contact
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.email && (
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>✉ {selected.email}</div>
                  )}
                  {selected.instagram && (
                    <div style={{ fontSize: 13, color: '#C9A84C' }}>{selected.instagram}</div>
                  )}
                  {!selected.email && !selected.instagram && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No contact info</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <ActionBtn variant="gold" className="flex-1">Draft Email</ActionBtn>
                <ActionBtn variant="green">Approve</ActionBtn>
                <ActionBtn variant="ghost">Skip</ActionBtn>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </div>
  )
}
