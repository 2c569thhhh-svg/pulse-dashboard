import type { Producer, OutreachEmail } from '@/types/database'

const PRODUCERS_KEY = 'pulse_producers'
const EMAILS_KEY = 'pulse_emails'

// ── Producers ─────────────────────────────────────────────────────────────────

export function getStoredProducers(): Producer[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(PRODUCERS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveProducer(producer: Producer): void {
  if (typeof window === 'undefined') return
  const existing = getStoredProducers()
  const idx = existing.findIndex(
    p => p.id === producer.id || (p.ipi_number && p.ipi_number === producer.ipi_number)
  )
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...producer }
  } else {
    existing.unshift(producer)
  }
  localStorage.setItem(PRODUCERS_KEY, JSON.stringify(existing))
}

export function updateProducerStatus(id: string, status: Producer['outreach_status']): void {
  const producers = getStoredProducers()
  const idx = producers.findIndex(p => p.id === id)
  if (idx >= 0) {
    producers[idx] = { ...producers[idx], outreach_status: status }
    localStorage.setItem(PRODUCERS_KEY, JSON.stringify(producers))
  }
}

// ── Emails ────────────────────────────────────────────────────────────────────

export function getStoredEmails(): OutreachEmail[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(EMAILS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveEmail(email: OutreachEmail): void {
  if (typeof window === 'undefined') return
  const existing = getStoredEmails()
  const idx = existing.findIndex(e => e.id === email.id)
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...email }
  } else {
    existing.unshift(email)
  }
  localStorage.setItem(EMAILS_KEY, JSON.stringify(existing))
}

export function removeEmail(id: string): void {
  if (typeof window === 'undefined') return
  const existing = getStoredEmails().filter(e => e.id !== id)
  localStorage.setItem(EMAILS_KEY, JSON.stringify(existing))
}

export function updateEmailStatus(id: string, status: OutreachEmail['status']): void {
  const emails = getStoredEmails()
  const idx = emails.findIndex(e => e.id === id)
  if (idx >= 0) {
    emails[idx] = { ...emails[idx], status, sent_at: status === 'SENT' ? new Date().toISOString() : emails[idx].sent_at }
    localStorage.setItem(EMAILS_KEY, JSON.stringify(emails))
  }
}

// ── Merge helpers ─────────────────────────────────────────────────────────────

export function mergeProducers(base: Producer[], stored: Producer[]): Producer[] {
  const map = new Map<string, Producer>()
  for (const p of base) map.set(p.id, p)
  for (const p of stored) {
    // Stored entries override base by id or ipi_number
    let foundKey: string | null = null
    map.forEach((x, key) => {
      if (x.id === p.id || (x.ipi_number && x.ipi_number === p.ipi_number)) foundKey = key
    })
    if (foundKey) {
      const existing = map.get(foundKey)!
      map.set(foundKey, { ...existing, ...p })
    } else {
      map.set(p.id, p)
    }
  }
  const result: Producer[] = []
  map.forEach(v => result.push(v))
  return result.sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0))
}

export function mergeEmails(base: OutreachEmail[], stored: OutreachEmail[]): OutreachEmail[] {
  const map = new Map<string, OutreachEmail>()
  for (const e of base) map.set(e.id, e)
  for (const e of stored) map.set(e.id, e)
  const result: OutreachEmail[] = []
  map.forEach(v => result.push(v))
  return result.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}
