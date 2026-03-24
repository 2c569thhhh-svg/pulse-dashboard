import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { mockEmails, mockProducers } from '@/lib/mock-data'
import { generateEmailDraft } from '@/lib/email-templates'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('outreach_emails')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) return NextResponse.json({ emails: data })
  } catch {}
  return NextResponse.json({ emails: mockEmails })
}

export async function POST(req: NextRequest) {
  const { producerId, producerData } = await req.json()
  if (!producerId && !producerData) {
    return NextResponse.json({ error: 'producerId or producerData required' }, { status: 400 })
  }

  // Use inline producer data if provided (works without DB)
  let producer = producerData || mockProducers.find(p => p.id === producerId)

  if (!producer) {
    try {
      const { data } = await supabase.from('producers').select('*').eq('id', producerId).single()
      if (data) producer = data
    } catch {}
  }

  if (!producer) return NextResponse.json({ error: 'Producer not found' }, { status: 404 })

  const draft = generateEmailDraft(producer)

  const email = {
    id: `email_${Date.now()}`,
    created_at: new Date().toISOString(),
    producer_id: producerId || producer.id,
    ...draft,
    status: 'DRAFT' as const,
    sent_at: null,
    opened_at: null,
    clicked_at: null,
    replied_at: null,
    template_used: 'uncollected-royalties',
    sendgrid_message_id: null,
  }

  try {
    const { data } = await supabase
      .from('outreach_emails')
      .insert({
        producer_id: email.producer_id,
        subject: email.subject,
        body: email.body,
        status: 'DRAFT',
        template_used: 'uncollected-royalties',
      })
      .select()
      .single()
    if (data) return NextResponse.json({ email: data })
  } catch {}

  return NextResponse.json({ email })
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    const { data, error } = await supabase
      .from('outreach_emails')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) return NextResponse.json({ email: data })
  } catch {}

  return NextResponse.json({ success: true })
}
