import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { mockProducers } from '@/lib/mock-data'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .order('ai_score', { ascending: false })
    if (!error && data) return NextResponse.json({ producers: data })
  } catch {}
  return NextResponse.json({ producers: mockProducers })
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    const { data, error } = await supabase
      .from('producers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) return NextResponse.json({ producer: data })
  } catch {}

  return NextResponse.json({ success: true })
}
