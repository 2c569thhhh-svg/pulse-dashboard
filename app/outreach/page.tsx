'use client'

import { useState } from 'react'
import { Panel, StatusBadge, ActionBtn } from '@/components/ui'
import { mockEmails, mockProducers } from '@/lib/mock-data'

const emailTemplates = [
  { id: 'uncollected-royalties', label: 'Uncollected Royalties' },
  { id: 'follow-up', label: 'Follow-Up' },
  { id: 'signed-intro', label: 'Signed Producer Intro' },
]

export default function OutreachPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'sent' | 'compose'>('queue')
  const [selectedTemplate, setSelectedTemplate] = useState('uncollected-royalties')
  const [composeBody, setComposeBody] = useState('')

  const approvedEmails = mockEmails.filter(e => ['DRAFT', 'APPROVED'].includes(e.status as string) || e.status === 'OPENED')
  const sentEmails = mockEmails.filter(e => ['SENT', 'OPENED', 'REPLIED'].includes(e.status))

  const getProducerName = (id: string) => mockProducers.find(p => p.id === id)?.writer_name || 'Unknown'

  return (
    <div style={{ padding: 32, maxWidth: 1400 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.02em', marginBottom: 6 }}>
          Outreach
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Email workflow — approval queue, sent history, and composer
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'In Queue', value: 3, color: '#C9A84C' },
          { label: 'Sent', value: mockEmails.length, color: '#5280E0' },
          { label: 'Opened', value: mockEmails.filter(e => e.opened_at).length, color: '#4CAF82' },
          { label: 'Replied', value: mockEmails.filter(e => e.replied_at).length, color: '#4CAF82' },
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: '16px 20px', borderLeft: `2px solid ${stat.color}` }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {stat.label}
            </div>
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
            {tab === 'queue' ? 'Approval Queue' : tab === 'sent' ? 'Sent History' : 'Compose'}
          </button>
        ))}
      </div>

      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {approvedEmails.map(email => {
            const producer = mockProducers.find(p => p.id === email.producer_id)
            return (
              <div key={email.id} className="glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {email.subject}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      To: {getProducerName(email.producer_id)}
                      {producer?.email && ` <${producer.email}>`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <StatusBadge status={email.status} />
                    {producer?.ai_score && (
                      <span style={{
                        background: 'rgba(201,168,76,0.15)',
                        color: '#C9A84C',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 20,
                      }}>
                        Score {producer.ai_score}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 8,
                    padding: '16px',
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    marginBottom: 16,
                    fontFamily: 'monospace',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {email.body}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <ActionBtn variant="green">Approve & Send</ActionBtn>
                  <ActionBtn variant="ghost">Edit Draft</ActionBtn>
                  <ActionBtn variant="red">Discard</ActionBtn>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'sent' && (
        <Panel title="Sent History" badge={sentEmails.length}>
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
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {getProducerName(email.producer_id)}
                  </td>
                  <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email.subject}
                  </td>
                  <td><StatusBadge status={email.status} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    {email.opened_at ? (
                      <span style={{ color: '#4CAF82', fontSize: 12 }}>
                        {new Date(email.opened_at).toLocaleDateString()}
                      </span>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    {email.replied_at ? (
                      <span style={{ color: '#4CAF82', fontWeight: 700, fontSize: 12 }}>✓ Replied</span>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    <ActionBtn size="sm" variant="ghost">Follow Up</ActionBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {activeTab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Panel title="Compose Email">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  PRODUCER
                </label>
                <select style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Syne, sans-serif' }}>
                  {mockProducers.filter(p => p.outreach_status === 'PENDING' || p.outreach_status === 'APPROVED').map(p => (
                    <option key={p.id} value={p.id}>{p.writer_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  TEMPLATE
                </label>
                <select
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Syne, sans-serif' }}
                >
                  {emailTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  SUBJECT
                </label>
                <input
                  placeholder='Your beat on "{song}" — ${amount}/mo uncollected'
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Syne, sans-serif', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  BODY
                </label>
                <textarea
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  rows={10}
                  placeholder="Email body..."
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Syne, sans-serif', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <ActionBtn variant="gold">Generate with AI</ActionBtn>
                <ActionBtn variant="green">Save Draft</ActionBtn>
              </div>
            </div>
          </Panel>

          <Panel title="Template Preview">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p style={{ marginBottom: 12, color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Subject:
              </p>
              <p style={{ marginBottom: 20, color: 'var(--text-primary)', fontWeight: 700 }}>
                Your beat on &quot;[Song Title]&quot; — $[Amount]/mo uncollected
              </p>

              <p style={{ marginBottom: 12, color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Key Points:
              </p>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>Name their exact song + artist</li>
                <li>State the specific dollar amount missing monthly</li>
                <li>Explain why (no publisher = missing royalty types)</li>
                <li>Credibility: Reyes Music × Raleigh MG, Miami</li>
                <li>No upfront cost — standard admin deal</li>
                <li>CTA: 15-min call to show exact breakdown</li>
              </ol>

              <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(201,168,76,0.07)', borderRadius: 8, border: '1px solid rgba(201,168,76,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#C9A84C', marginBottom: 6 }}>SCORING RUBRIC</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                  <div>Streams: 5M+=40pts, 1M+=30pts, 500K+=20pts</div>
                  <div>No Publisher: +30pts</div>
                  <div>Email found: +20pts, IG only: +12pts</div>
                  <div>Catalog 10+ songs: +10pts</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
