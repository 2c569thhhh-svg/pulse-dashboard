'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Panel, StatusBadge, ScoreBadge, Streams, ActionBtn } from '@/components/ui'
import { mockProducers } from '@/lib/mock-data'
import { generateEmailDraft } from '@/lib/email-templates'
import {
  getStoredProducers,
  saveProducer,
  saveEmail,
  mergeProducers,
} from '@/lib/pipeline-store'
import type { Producer, OutreachEmail } from '@/types/database'

export default function ProducersPage() {
  const router = useRouter()
  const [producers, setProducers] = useState<Producer[]>(mockProducers)
  const [search, setSearch] = useState('')
  const [filterPublisher, setFilterPublisher] = useState('ALL')
  const [filterOutreach, setFilterOutreach] = useState('ALL')
  const [selected, setSelected] = useState<Producer | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Merge mock + localStorage on mount
  useEffect(() => {
    const stored = getStoredProducers()
    setProducers(mergeProducers(mockProducers, stored))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleApprove = (producer: Producer, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const updated = { ...producer, outreach_status: 'APPROVED' as const }
    setProducers(prev => prev.map(p => p.id === producer.id ? updated : p))
    if (selected?.id === producer.id) setSelected(updated)
    saveProducer(updated)
    fetch('/api/producers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: producer.id, outreach_status: 'APPROVED' }),
    }).catch(() => {})
    showToast(`✓ ${producer.writer_name} approved for outreach`)
  }

  const handleSkip = (producer: Producer, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const updated = { ...producer, outreach_status: 'SKIPPED' as const }
    setProducers(prev => prev.map(p => p.id === producer.id ? updated : p))
    if (selected?.id === producer.id) setSelected(updated)
    saveProducer(updated)
    fetch('/api/producers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: producer.id, outreach_status: 'SKIPPED' }),
    }).catch(() => {})
    showToast(`Skipped ${producer.writer_name}`)
  }

  const handleDraftEmail = (producer: Producer, e?: React.MouseEvent) => {
    e?.stopPropagation()
    // Mark as approved if not already
    if (producer.outreach_status === 'PENDING') handleApprove(producer)

    const draft = generateEmailDraft(producer)
    const email: OutreachEmail = {
      id: `email_${Date.now()}`,
      created_at: new Date().toISOString(),
      producer_id: producer.id,
      ...draft,
      status: 'DRAFT',
      sent_at: null,
      opened_at: null,
      clicked_at: null,
      replied_at: null,
      template_used: 'uncollected-royalties',
      sendgrid_message_id: null,
    }
    saveEmail(email)
    fetch('/api/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producerId: producer.id, producerData: producer }),
    }).catch(() => {})
    showToast('✓ Email draft created')
    setTimeout(() => router.push('/outreach'), 1200)
  }

  const filtered = producers.filter(p => {
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
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.02em', marginBottom: 6 }}>
          Producer Database
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {producers.length} producers in pipeline · {producers.filter(p => p.publisher_status === 'NO_PUBLISHER').length} with no publisher
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, artist, or song..."
          style={{
            flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)',
            fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none',
          }}
        />
        <select
          value={filterPublisher}
          onChange={e => setFilterPublisher(e.target.value)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
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
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
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
                    style={{ cursor: 'pointer', background: selected?.id === p.id ? 'rgba(201,168,76,0.06)' : undefined }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{p.writer_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.pro} · IPI {p.ipi_number}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p.top_song || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.associated_artists.slice(0, 2).join(', ')}</div>
                    </td>
                    <td><ScoreBadge score={p.ai_score} /></td>
                    <td><Streams value={p.spotify_streams} /></td>
                    <td>
                      {p.estimated_monthly_royalties
                        ? <span style={{ color: '#4CAF82', fontWeight: 700 }}>${p.estimated_monthly_royalties.toLocaleString()}</span>
                        : '—'}
                    </td>
                    <td><StatusBadge status={p.publisher_status} /></td>
                    <td><StatusBadge status={p.outreach_status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {p.email && <span style={{ fontSize: 10, color: '#4CAF82', fontWeight: 600 }}>EMAIL</span>}
                        {p.instagram && <span style={{ fontSize: 10, color: '#C9A84C', fontWeight: 600 }}>IG</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {p.outreach_status === 'SKIPPED' ? (
                          <ActionBtn size="sm" variant="ghost" onClick={e => handleApprove(p, e)}>Restore</ActionBtn>
                        ) : (
                          <>
                            <ActionBtn size="sm" variant="green" onClick={e => handleApprove(p, e)}
                              disabled={['APPROVED', 'SENT', 'OPENED', 'REPLIED', 'SIGNED'].includes(p.outreach_status)}>
                              Approve
                            </ActionBtn>
                            <ActionBtn size="sm" variant="ghost" onClick={e => handleSkip(p, e)}>Skip</ActionBtn>
                          </>
                        )}
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
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>IPI: {selected.ipi_number} · {selected.pro}</div>
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
                  <div style={{ color: '#4CAF82', fontWeight: 700 }}>${selected.estimated_monthly_royalties?.toLocaleString() || '—'}</div>
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Streams</div>
                  <Streams value={selected.spotify_streams} />
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Catalog</div>
                  <div style={{ fontWeight: 700 }}>{selected.catalog_count ?? '—'} songs</div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Associated Artists</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selected.associated_artists.map(a => (
                    <span key={a} style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-secondary)', fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>{a}</span>
                  ))}
                </div>
              </div>

              {selected.reasoning && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>AI Analysis</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.reasoning}</p>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Contact</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.email && <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>✉ {selected.email}</div>}
                  {selected.instagram && <div style={{ fontSize: 13, color: '#C9A84C' }}>{selected.instagram}</div>}
                  {!selected.email && !selected.instagram && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No contact info on file</div>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <ActionBtn variant="gold" onClick={() => handleDraftEmail(selected)}>
                    Draft Email
                  </ActionBtn>
                </div>
                <ActionBtn variant="green" onClick={() => handleApprove(selected)}
                  disabled={['APPROVED', 'SENT', 'OPENED', 'REPLIED', 'SIGNED'].includes(selected.outreach_status)}>
                  Approve
                </ActionBtn>
                <ActionBtn variant="ghost" onClick={() => handleSkip(selected)}>Skip</ActionBtn>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </div>
  )
}
