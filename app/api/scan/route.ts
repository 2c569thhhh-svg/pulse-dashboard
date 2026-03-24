import { NextRequest, NextResponse } from 'next/server'
import { scanArtistForLeads } from '@/lib/soundcharts'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { artistName } = await req.json()

  if (!artistName) {
    return NextResponse.json({ error: 'artistName is required' }, { status: 400 })
  }

  // Create scan job record
  const { data: job, error: jobError } = await supabase
    .from('scan_jobs')
    .insert({
      artist_name: artistName,
      status: 'RUNNING',
      started_at: new Date().toISOString(),
      triggered_by: 'api',
    })
    .select()
    .single()

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 })
  }

  try {
    const { artist, songs, leads, writersFound } = await scanArtistForLeads(artistName)

    // Insert leads into producers table
    for (const lead of leads) {
      await supabase.from('producers').upsert({
        writer_name: lead.writer_name,
        ipi_number: lead.ipi_number,
        pro: lead.pro,
        publisher_status: lead.publisher_status,
        outreach_status: 'PENDING',
        associated_artists: [lead.associated_artist],
        top_song: lead.song_title,
      }, { onConflict: 'ipi_number' })
    }

    // Update job as completed
    await supabase
      .from('scan_jobs')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        songs_scanned: songs.length,
        writers_found: writersFound,
        leads_found: leads.length,
      })
      .eq('id', job.id)

    return NextResponse.json({
      success: true,
      artist: artist.name,
      songsScanned: songs.length,
      writersFound,
      leadsFound: leads.length,
      leads,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    await supabase
      .from('scan_jobs')
      .update({
        status: 'FAILED',
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq('id', job.id)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  const { data: jobs } = await supabase
    .from('scan_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ jobs })
}
