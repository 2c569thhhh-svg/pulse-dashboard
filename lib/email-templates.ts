export interface EmailDraft {
  subject: string
  body: string
}

export function generateEmailDraft(producer: {
  writer_name: string
  top_song?: string | null
  associated_artists?: string[]
  estimated_monthly_royalties?: number | null
  pro?: string | null
}): EmailDraft {
  const name = producer.writer_name
  const song = producer.top_song || 'your catalog'
  const artist = producer.associated_artists?.[0] || 'the artist'
  const amount = producer.estimated_monthly_royalties
    ? `$${producer.estimated_monthly_royalties.toLocaleString()}`
    : 'significant royalties'
  const pro = producer.pro || 'your PRO'

  return {
    subject: `Your beat on "${song}" — ${amount}/mo uncollected`,
    body: `Hey ${name},

Quick question — are you collecting your full publishing royalties on "${song}"?

I run Reyes Music, a publishing admin company. We pulled your IPI and you have no publisher on record — which means every time that song plays on Spotify, Apple Music, YouTube, or gets licensed, you're only collecting writer's share through ${pro}. The publisher's share is just... gone.

On a song with ${artist}'s numbers, we're estimating roughly ${amount}/month in uncollected publisher's share — across streaming, YouTube Content ID, radio performance, and international digital. Every month.

We do admin deals — no upfront cost, you keep your masters, you keep creative control. We handle all the backend: PRO registration, international collections, sync licensing, YouTube Content ID. Standard 15% admin fee, only on what we collect.

I'd love to hop on a 15-minute call and show you exactly what you're missing. No pitch, just data.

— David Reyes
Reyes Music × Raleigh MG
Miami, FL`,
  }
}
