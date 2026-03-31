'use client'

import { useState, useCallback } from 'react'
import { Panel, StatusBadge, ScoreBadge, Streams, ActionBtn } from '@/components/ui'
import { mockProducers } from '@/lib/mock-data'
import type { Producer, ReportReason } from '@/types/database'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAccuracyScore(p: Producer): number {
  const now = Date.now()
  const verifiedAt = p.last_verified_at ? new Date(p.last_verified_at).getTime() : null
  const hoursSince = verifiedAt ? (now - verifiedAt) / (1000 * 60 * 60) : Infinity
  if (p.double_verified && hoursSince < 24) return 98
  if (p.human_verified && hoursSince < 48) return 94
  if (p.human_verified && hoursSince < 168) return 87
  return 71
}

function AccuracyScore({ score }: { score: number }) {
  const color = score >= 95 ? '#4CAF82' : score >= 88 ? '#C9A84C' : score >= 78 ? '#E09B52' : '#E05252'
  return (
    <span style={{ color, fontWeight: 700, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
      {score}%
    </span>
  )
}

function DaysInDbPill({ days }: { days: number }) {
  if (days >= 30) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'rgba(224,82,82,0.14)', color: '#E05252',
        border: '1px solid rgba(224,82,82,0.28)',
        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
        whiteSpace: 'nowrap',
      }}>
        🚨 At Risk
      </span>
    )
  }
  if (days >= 14) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'rgba(201,168,76,0.12)', color: '#C9A84C',
        border: '1px solid rgba(201,168,76,0.25)',
        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
        whiteSpace: 'nowrap',
      }}>
        ⚠️ {days}d — act soon
      </span>
    )
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
      border: '1px solid rgba(255,255,255,0.08)',
      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
      whiteSpace: 'nowrap',
    }}>
      {days}d
    </span>
  )
}

// ─── Report Modal ─────────────────────────────────────────────────────────────

interface ReportModalProps {
  producer: Producer
  onClose: () => void
  onSubmit: (producerId: string, reason: ReportReason, note: string) => void
}

function ReportModal({ producer, onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [note, setNote] = useState('')

  const options: { value: ReportReason; label: string }[] = [
    { value: 'IS_PUBLISHED', label: 'Writer IS published — I verified this myself' },
    { value: 'SELF_COLLECTING', label: 'Writer is self-collecting — has their own entity' },
    { value: 'WRONG_CONTACT', label: 'Contact information is wrong' },
    { value: 'OTHER', label: 'Other' },
  ]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0e0e18',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 28,
          width: 460,
          maxWidth: '90vw',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Report Incorrect Data</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{producer.writer_name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setReason(opt.value)}
              style={{
                textAlign: 'left',
                background: reason === opt.value ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${reason === opt.value ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                padding: '10px 14px',
                color: reason === opt.value ? '#C9A84C' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: reason === opt.value ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.12s ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {reason === 'OTHER' && (
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Describe the issue..."
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
              padding: '10px 14px', color: 'var(--text-primary)',
              fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
              minHeight: 80, outline: 'none', marginBottom: 16,
            }}
          />
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <ActionBtn variant="ghost" onClick={onClose}>Cancel</ActionBtn>
          <ActionBtn
            variant="gold"
            disabled={!reason}
            onClick={() => reason && onSubmit(producer.id, reason, note)}
          >
            Submit Report
          </ActionBtn>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ApproveState = 'idle' | 'shimmer' | 'claimed' | 'queued'

export default function ProducersPage() {
  const [search, setSearch] = useState('')
  const [filterPublisher, setFilterPublisher] = useState('ALL')
  const [filterOutreach, setFilterOutreach] = useState('ALL')
  const [filterVerified, setFilterVerified] = useState(false)
  const [sortByAccuracy, setSortByAccuracy] = useState(false)
  const [selected, setSelected] = useState<Producer | null>(null)
  const [approveStates, setApproveStates] = useState<Record<string, ApproveState>>({})
  const [approveTimestamps, setApproveTimestamps] = useState<Record<string, string>>({})
  const [reportModal, setReportModal] = useState<Producer | null>(null)
  const [underReview, setUnderReview] = useState<Set<string>>(new Set())
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // ─── Approve flow ───────────────────────────────────────────────────────────
  const handleApprove = useCallback((producerId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setApproveStates(prev => ({ ...prev, [producerId]: 'shimmer' }))
    setTimeout(() => {
      setApproveStates(prev => ({ ...prev, [producerId]: 'claimed' }))
      setApproveTimestamps(prev => ({ ...prev, [producerId]: new Date().toLocaleTimeString() }))
    }, 200)
    setTimeout(() => {
      setApproveStates(prev => ({ ...prev, [producerId]: 'queued' }))
    }, 1200)
  }, [])

  // ─── Report flow ────────────────────────────────────────────────────────────
  const handleReport = useCallback((producerId: string, reason: ReportReason, _note: string) => {
    setUnderReview(prev => new Set(prev).add(producerId))
    setReportModal(null)
    setToastMsg('Report received. This lead is paused pending reverification. We\'ll update the record within 24 hours.')
    setTimeout(() => setToastMsg(null), 5000)
  }, [])

  // ─── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = mockProducers.filter(p => {
    if (underReview.has(p.id)) return false
    const matchSearch = !search ||
      p.writer_name.toLowerCase().includes(search.toLowerCase()) ||
      p.associated_artists.some(a => a.toLowerCase().includes(search.toLowerCase())) ||
      (p.top_song || '').toLowerCase().includes(search.toLowerCase())
    const matchPub = filterPublisher === 'ALL' || p.publisher_status === filterPublisher
    const matchOut = filterOutreach === 'ALL' || p.outreach_status === filterOutreach
    const matchVerified = !filterVerified || p.double_verified
    return matchSearch && matchPub && matchOut && matchVerified
  })

  const sorted = sortByAccuracy
    ? [...filtered].sort((a, b) => getAccuracyScore(b) - getAccuracyScore(a))
    : filtered

  const atRisk = sorted.filter(p => (p.days_in_db ?? 0) >= 30)
  const normal = sorted.filter(p => (p.days_in_db ?? 0) < 30)

  // ─── Table row renderer ─────────────────────────────────────────────────────
  const renderRow = (p: Producer, isAtRisk = false) => {
    const aState = approveStates[p.id] || 'idle'
    const isQueued = aState === 'queued'
    const isClaimed = aState === 'claimed'
    const isShimmer = aState === 'shimmer' || isClaimed
    const accuracy = getAccuracyScore(p)
    const isReviewed = underReview.has(p.id)

    return (
      <tr
        key={p.id}
        onClick={() => setSelected(selected?.id === p.id ? null : p)}
        className={isShimmer ? 'row-gold-flash' : isAtRisk ? 'at-risk-row' : undefined}
        style={{
          cursor: 'pointer',
          background: selected?.id === p.id ? 'rgba(201,168,76,0.06)' : undefined,
          position: 'relative',
        }}
      >
        {/* Lead Claimed overlay */}
        {isClaimed && (
          <td colSpan={10} style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', zIndex: 10,
          }}>
            <span className="lead-claimed-overlay" style={{
              color: '#C9A84C', fontWeight: 800, fontSize: 15,
              letterSpacing: '0.04em', textShadow: '0 0 20px rgba(201,168,76,0.6)',
            }}>
              ✓ Lead Claimed
            </span>
          </td>
        )}

        <td>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                {p.writer_name}
              </span>
              {p.double_verified && (
                <span className="badge-double-verified">✓✓ Double Verified</span>
              )}
              {isReviewed && (
                <span className="badge-under-review">Under Review</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {p.pro} · IPI {p.ipi_number}
            </div>
            <div style={{ marginTop: 2 }}>
              <DaysInDbPill days={p.days_in_db ?? 0} />
            </div>
          </div>
        </td>

        <td>
          <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p.top_song || '—'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {p.associated_artists.slice(0, 2).join(', ')}
          </div>
        </td>

        <td><AccuracyScore score={accuracy} /></td>
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
        <td>
          {isQueued ? (
            <div>
              <span style={{
                background: 'rgba(201,168,76,0.14)', color: '#C9A84C',
                fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
              }}>
                Outreach Queued
              </span>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                {approveTimestamps[p.id]}
              </div>
            </div>
          ) : (
            <StatusBadge status={p.outreach_status} />
          )}
        </td>
        <td>
          <div style={{ display: 'flex', gap: 6 }}>
            {p.email && <span style={{ fontSize: 10, color: '#4CAF82', fontWeight: 600 }}>EMAIL</span>}
            {p.instagram && <span style={{ fontSize: 10, color: '#C9A84C', fontWeight: 600 }}>IG</span>}
          </div>
        </td>
        <td>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {!isQueued && (
              <ActionBtn size="sm" variant="green" onClick={e => handleApprove(p.id, e)}>
                Approve
              </ActionBtn>
            )}
            <ActionBtn size="sm" variant="ghost" onClick={e => { e?.stopPropagation() }}>
              Skip
            </ActionBtn>
            <button
              title="Report incorrect data"
              onClick={e => { e.stopPropagation(); setReportModal(p) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 14, padding: '2px 4px',
                lineHeight: 1, borderRadius: 4, transition: 'color 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E05252')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              🚩
            </button>
          </div>
        </td>
      </tr>
    )
  }

  // ─── Table header ───────────────────────────────────────────────────────────
  const tableHead = (
    <thead>
      <tr>
        <th>Writer</th>
        <th>Top Song</th>
        <th
          onClick={() => setSortByAccuracy(s => !s)}
          style={{ cursor: 'pointer', userSelect: 'none', color: sortByAccuracy ? '#C9A84C' : undefined }}
          title="Click to sort by accuracy"
        >
          Accuracy {sortByAccuracy ? '↓' : '⇅'}
        </th>
        <th>Score</th>
        <th>Streams</th>
        <th>Royalties/mo</th>
        <th>Publisher</th>
        <th>Outreach</th>
        <th>Contact</th>
        <th></th>
      </tr>
    </thead>
  )

  return (
    <div style={{ padding: 32, maxWidth: 1500 }}>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          background: '#0e0e18', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 12, padding: '14px 20px', maxWidth: 380,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{toastMsg}</div>
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <ReportModal
          producer={reportModal}
          onClose={() => setReportModal(null)}
          onSubmit={handleReport}
        />
      )}

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.02em', marginBottom: 6 }}>
          Producer Database
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {mockProducers.length} producers in pipeline · {mockProducers.filter(p => p.publisher_status === 'NO_PUBLISHER').length} with no publisher
          {atRisk.length > 0 && (
            <span style={{ color: '#E05252', fontWeight: 600 }}> · {atRisk.length} at risk</span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, artist, or song..."
          style={{
            flex: 1, minWidth: 200,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 16px',
            color: 'var(--text-primary)', fontSize: 13,
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        <select
          value={filterPublisher}
          onChange={e => setFilterPublisher(e.target.value)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
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
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
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
        <button
          onClick={() => setFilterVerified(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: filterVerified ? 'rgba(91,141,239,0.12)' : 'var(--bg-card)',
            border: `1px solid ${filterVerified ? 'rgba(91,141,239,0.35)' : 'var(--border)'}`,
            borderRadius: 8, padding: '10px 16px',
            color: filterVerified ? '#5b8def' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: filterVerified ? 600 : 400,
            fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          ✓✓ Verified Leads Only
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── At Risk Section ─────────────────────────────────────────────── */}
          {atRisk.length > 0 && (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              }}>
                <span style={{
                  background: 'rgba(224,82,82,0.12)', color: '#E05252',
                  border: '1px solid rgba(224,82,82,0.25)',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                }}>
                  🚨 AT RISK — {atRisk.length} LEAD{atRisk.length > 1 ? 'S' : ''}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  30+ days without contact — competitors may be watching
                </span>
              </div>

              {atRisk.map(p => (
                <div
                  key={p.id}
                  style={{
                    background: 'rgba(224,82,82,0.04)',
                    border: '1px solid rgba(224,82,82,0.18)',
                    borderLeft: '3px solid rgba(224,82,82,0.6)',
                    borderRadius: 10,
                    padding: '14px 18px',
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelected(selected?.id === p.id ? null : p)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{p.writer_name}</span>
                      <ScoreBadge score={p.ai_score} />
                      <DaysInDbPill days={p.days_in_db ?? 0} />
                    </div>
                    <p style={{ fontSize: 12, color: '#E05252', marginBottom: 6, lineHeight: 1.5 }}>
                      This producer has been in your database {p.days_in_db}+ days without contact. Competitor publishers scanning similar catalogs may have already reached out.
                    </p>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {p.associated_artists.slice(0, 3).join(', ')} · {p.top_song} · ${p.estimated_monthly_royalties?.toLocaleString()}/mo
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                    <ActionBtn size="sm" variant="green" onClick={e => handleApprove(p.id, e)}>
                      Approve Now
                    </ActionBtn>
                    <button
                      title="Report incorrect data"
                      onClick={e => { e.stopPropagation(); setReportModal(p) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: '2px 4px' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#E05252')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      🚩
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Main Table ───────────────────────────────────────────────────── */}
          <Panel
            title="Producers"
            badge={normal.length}
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {filterVerified && (
                  <span style={{ fontSize: 11, color: '#5b8def', fontWeight: 600 }}>
                    Showing verified only
                  </span>
                )}
              </div>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                {tableHead}
                <tbody>
                  {normal.map(p => renderRow(p, false))}
                </tbody>
              </table>
              {normal.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                  No producers match your filters
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* ── Detail Panel ─────────────────────────────────────────────────── */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Panel>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800 }}>{selected.writer_name}</h2>
                    {selected.double_verified && (
                      <span className="badge-double-verified">✓✓ Double Verified</span>
                    )}
                  </div>
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
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Accuracy</div>
                  <AccuracyScore score={getAccuracyScore(selected)} />
                </div>
                <div className="glass-card" style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Days in DB</div>
                  <DaysInDbPill days={selected.days_in_db ?? 0} />
                </div>
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
                    <span key={a} style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-secondary)', fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>{a}</span>
                  ))}
                </div>
              </div>

              {selected.reasoning && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    AI Analysis
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.reasoning}</p>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Contact
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.email && <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>✉ {selected.email}</div>}
                  {selected.instagram && <div style={{ fontSize: 13, color: '#C9A84C' }}>{selected.instagram}</div>}
                  {!selected.email && !selected.instagram && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No contact info</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <ActionBtn variant="gold" className="flex-1">Draft Email</ActionBtn>
                <ActionBtn variant="green" onClick={() => handleApprove(selected.id)}>Approve</ActionBtn>
                <ActionBtn variant="ghost">Skip</ActionBtn>
                <ActionBtn variant="ghost" onClick={() => setReportModal(selected)}>🚩</ActionBtn>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </div>
  )
}
