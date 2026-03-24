'use client'

import { useState, useEffect } from 'react'
import { Panel, StatusBadge, ActionBtn } from '@/components/ui'
import { mockEmails, mockProducers } from '@/lib/mock-data'
import { generateEmailDraft } from '@/lib/email-templates'
import {
  getStoredEmails,
  getStoredProducers,
  saveEmail,
  removeEmail,
  updateEmailStatus,
  mergeEmails,
  mergeProducers,
} from '@/lib/pipeline-store'
import type { OutreachEmail } from '@/types/database'

const emailTemplates = [
  { id: 'uncollected-royalties', label: 'Uncollected Royalties' },
  { id: 'follow-up', label: 'Follow-Up' },
  { id: 'signed-intro', label: 'Signed Producer Intro' },
]

export default function OutreachPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'sent' | 'compose'>('queue')
  const [emails, setEmails] = useState<OutreachEmail[]>(mockEmails)
  const [producers, setProducers] = useState(mockProducers)
  const [selectedTemplate, setSelectedTemplate] = useState('uncollected-royalties')
  const [composeProducerId, setComposeProducerId] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const storedEmails = getStoredEmails()
    const storedProducers = getStoredProducers()
    setEmails(mergeEmails(mockEmails, storedEmails))
    setProducers(mergeProducers(mockProducers, storedProducers))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const getProducerName = (id: string) =>
    producers.find(p => p.id === id)?.writer_name || 'Unknown'

  const getProducer = (id: string) => producers.find(p => p.id === id)

  const handleApproveAndSend = (email: OutreachEmail) => {
    const updated = { ...email, status: 'SENT' as const, sent_at: new Date().toISOString() }
    setEmails(prev => prev.map(e => e.id === email.id ? updated : e))
    updateEmailStatus(email.id, 'SENT')
    fetch('/api/outreach', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: email.id, status: 'SENT', sent_at: new Date().toISOString() }),
    }).catch(() => {})
    showToast(`✓ Email sent to ${getProducerName(email.producer_id)}`)
  }

  const handleDiscard = (email: OutreachEmail) => {
    setEmails(prev => prev.filter(e => e.id !== email.id))
    removeEmail(email.id)
    showToast('Email discarded')
  }

  const handleStartEdit = (email: OutreachEmail) => {
    setEditingId(email.id)
    setEditBody(email.body)
  }

  const handleSaveEdit = (email: OutreachEmail) => {
    const updated = { ...email, body: editBody }
    setEmails(prev => prev.map(e => e.id === email.id ? updated : e))
    saveEmail(updated)
    setEditingId(null)
    showToast('Draft saved')
  }

  const handleFollowUp = (email: OutreachEmail) => {
    const producer = getProducer(email.producer_id)
    const draft = generateEmailDraft({
      writer_name: getProducerName(email.producer_id),
      top_song: producer?.top_song,
      associated_artists: producer?.associated_artists,
      estimated_monthly_royalties: producer?.estimated_monthly_royalties,
      pro: producer?.pro,
    })
    const followUp: OutreachEmail = {
      id: `email_followup_${Date.now()}`,
      created_at: new Date().toISOString(),
      producer_id: email.producer_id,
      subject: `Follow-up: ${draft.subject}`,
      body: `Hey — just following up on my last message.\n\n${draft.body}`,
      status: 'DRAFT',
      sent_at: null,
      opened_at: null,
      clicked_at: null,
      replied_at: null,
      template_used: 'follow-up',
      sendgrid_message_id: null,
    }
    setEmails(prev => [followUp, ...prev])
    saveEmail(followUp)
    setActiveTab('queue')
    showToast('✓ Follow-up draft created')
  }

  const handleGenerateWithAI = () => {
    if (!composeProducerId) return
    const producer = producers.find(p => p.id === composeProducerId) || producers[0]
    const draft = generateEmailDraft(producer)
    setComposeSubject(draft.subject)
    setComposeBody(draft.body)
    showToast('✓ Email generated from template')
  }

  const handleSaveDraft = () => {
    if (!composeBody.trim()) return
    const producerId = composeProducerId || producers[0]?.id
    const draft: OutreachEmail = {
      id: `email_compose_${Date.now()}`,
      created_at: new Date().toISOString(),
      producer_id: producerId,
      subject: composeSubject || 'Untitled Draft',
      body: composeBody,
      status: 'DRAFT',
      sent_at: null,
      opened_at: null,
      clicked_at: null,
      replied_at: null,
      template_used: selectedTemplate,
      sendgrid_message_id: null,
    }
    setEmails(prev => [draft, ...prev])
    saveEmail(draft)
    setComposeBody('')
    setComposeSubject('')
    setActiveTab('queue')
    showToast('✓ Draft saved to queue')
  }

  const queueEmails = emails.filter(e => ['DRAFT', 'APPROVED'].includes(e.status))
  const sentEmails = emails.filter(e => ['SENT', 'OPENED', 'REPLIED'].includes(e.status))

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
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.02em', marginBottom: 6 }}>Outreach</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Email workflow — approval queue, sent history, and composer</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'In Queue', value: queueEmails.length, color: '#C9A84C' },
          { label: 'Sent', value: sentEmails.length, color: '#5280E0' },
          { label: 'Opened', value: emails.filter(e => e.opened_at).length, color: '#4CAF82' },
          { label: 'Replied', value: emails.filter(e => e.replied_at).length, color: '#4CAF82' },
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: '16px 20px', borderLeft: `2px solid ${stat.color}` }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', width: 'fit-content' }}>
        {(['queue', 'sent', 'compose'] as const).map(tab => (
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
            {tab === 'queue' ? `Approval Queue${queueEmails.length > 0 ? ` (${queueEmails.length})` : ''}` : tab === 'sent' ? 'Sent History' : 'Compose'}
          </button>
        ))}
      </div>

      {/* ── Approval Queue ── */}
      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {queueEmails.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-muted)', fontSize: 14 }}>
              <div style={{ marginBottom: 8, fontSize: 20 }}>📭</div>
              No drafts in queue — approve producers from the Leads page or run a scan
            </div>
          )}
          {queueEmails.map(email => {
            const producer = getProducer(email.producer_id)
            const isEditing = editingId === email.id
            return (
              <div key={email.id} className="glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{email.subject}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      To: {getProducerName(email.producer_id)}
                      {producer?.email && ` <${producer.email}>`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <StatusBadge status={email.status} />
                    {producer?.ai_score != null && (
                      <span style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                        Score {producer.ai_score}
                      </span>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    rows={10}
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: 16, fontSize: 12, color: 'var(--text-primary)',
                      lineHeight: 1.7, fontFamily: 'monospace', marginBottom: 12, resize: 'vertical', outline: 'none',
                    }}
                  />
                ) : (
                  <div style={{
                    background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 16,
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
                    whiteSpace: 'pre-wrap', marginBottom: 16, fontFamily: 'monospace',
                    maxHeight: 200, overflow: 'auto',
                  }}>
                    {email.body}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <ActionBtn variant="green" onClick={() => handleApproveAndSend(email)}>
                    Approve &amp; Send
                  </ActionBtn>
                  {isEditing ? (
                    <>
                      <ActionBtn variant="gold" onClick={() => handleSaveEdit(email)}>Save Changes</ActionBtn>
                      <ActionBtn variant="ghost" onClick={() => setEditingId(null)}>Cancel</ActionBtn>
                    </>
                  ) : (
                    <ActionBtn variant="ghost" onClick={() => handleStartEdit(email)}>Edit Draft</ActionBtn>
                  )}
                  <ActionBtn variant="red" onClick={() => handleDiscard(email)}>Discard</ActionBtn>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Sent History ── */}
      {activeTab === 'sent' && (
        <Panel title="Sent History" badge={sentEmails.length}>
          {sentEmails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
              No sent emails yet — approve drafts from the queue to send them
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producer</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Opened</th>
                  <th>Replied</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sentEmails.map(email => (
                  <tr key={email.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getProducerName(email.producer_id)}</td>
                    <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.subject}</td>
                    <td><StatusBadge status={email.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {email.opened_at
                        ? <span style={{ color: '#4CAF82', fontSize: 12 }}>{new Date(email.opened_at).toLocaleDateString()}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      {email.replied_at
                        ? <span style={{ color: '#4CAF82', fontWeight: 700, fontSize: 12 }}>✓ Replied</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      <ActionBtn size="sm" variant="ghost" onClick={() => handleFollowUp(email)}>Follow Up</ActionBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      )}

      {/* ── Compose ── */}
      {activeTab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Panel title="Compose Email">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>PRODUCER</label>
                <select
                  value={composeProducerId}
                  onChange={e => setComposeProducerId(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Select a producer...</option>
                  {producers.filter(p => ['PENDING', 'APPROVED'].includes(p.outreach_status)).map(p => (
                    <option key={p.id} value={p.id}>{p.writer_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>TEMPLATE</label>
                <select
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
                >
                  {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>SUBJECT</label>
                <input
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                  placeholder='Your beat on "{song}" — ${amount}/mo uncollected'
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>BODY</label>
                <textarea
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  rows={10}
                  placeholder="Email body..."
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <ActionBtn variant="gold" onClick={handleGenerateWithAI} disabled={!composeProducerId}>
                  Generate from Template
                </ActionBtn>
                <ActionBtn variant="green" onClick={handleSaveDraft} disabled={!composeBody.trim()}>
                  Save Draft
                </ActionBtn>
              </div>
            </div>
          </Panel>

          <Panel title="Template Guide">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p style={{ marginBottom: 8, color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subject Line Formula</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13 }}>Your beat on &quot;[Song Title]&quot; — $[Amount]/mo uncollected</p>
              </div>
              <div>
                <p style={{ marginBottom: 8, color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email Key Points</p>
                <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <li>Name their exact song + featured artist</li>
                  <li>State the specific dollar amount missing monthly</li>
                  <li>Explain the split: writer&apos;s share only ≠ full royalties</li>
                  <li>Credibility: Reyes Music × Raleigh MG, Miami</li>
                  <li>No upfront cost — standard 15% admin deal</li>
                  <li>CTA: 15-min call to show exact catalog breakdown</li>
                </ol>
              </div>
              <div style={{ background: 'rgba(76,175,130,0.06)', border: '1px solid rgba(76,175,130,0.15)', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4CAF82', letterSpacing: '0.07em', marginBottom: 10 }}>ROYALTY ESTIMATE METHODOLOGY</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Streaming (Spotify/Apple/Amazon)</span>
                    <span style={{ color: 'var(--text-secondary)' }}>~$0.0004/stream pub share</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>YouTube Content ID mechanical</span>
                    <span style={{ color: 'var(--text-secondary)' }}>~20–30% of streaming total</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Radio performance (ASCAP/BMI)</span>
                    <span style={{ color: 'var(--text-secondary)' }}>varies by market + airplay</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>International digital mechanicals</span>
                    <span style={{ color: 'var(--text-secondary)' }}>15–25% uplift on digital</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
