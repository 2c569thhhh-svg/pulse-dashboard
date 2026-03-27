import { NextRequest, NextResponse } from 'next/server'
import { scanArtistForLeads } from '@/lib/soundcharts'
import { supabase } from '@/lib/supabase'

// ── Demo data for when Soundcharts isn't configured ───────────────────────────
const DEMO_WRITERS: Record<string, Array<{ writer_name: string; ipi_number: string | null; pro: string | null; publisher_status: string; song_title: string }>> = {
  default: [
    { writer_name: 'TreOnTheBeat', ipi_number: '00523847291', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Track 1' },
    { writer_name: 'Chopsquad DJ', ipi_number: '00847362910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Track 3' },
    { writer_name: 'Roark Bailey', ipi_number: '00391847562', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Track 5' },
    { writer_name: 'ATL Jacob', ipi_number: '00573829164', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Track 7' },
    { writer_name: 'DemBoiz', ipi_number: '00194837261', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Track 9' },
  ],
  'lil durk': [
    { writer_name: 'TreOnTheBeat', ipi_number: '00523847291', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Back on BS' },
    { writer_name: 'CashMoneyAP', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'What Happened to Virgil' },
    { writer_name: 'Southside', ipi_number: '00837261940', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: '6lack (Feat. 6LACK)' },
  ],
  'polo g': [
    { writer_name: 'Roark Bailey', ipi_number: '00391847562', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Pop Out' },
    { writer_name: 'Taurean Orr', ipi_number: null, pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Martin & Gina' },
  ],
  'rod wave': [
    { writer_name: 'Chopsquad DJ', ipi_number: '00847362910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Heart on Ice' },
    { writer_name: 'MexikoDro', ipi_number: '00284716390', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Richer' },
  ],
  'moneybagg yo': [
    { writer_name: 'Wheezy', ipi_number: '00627384910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Said Sum' },
    { writer_name: 'JetsonMade', ipi_number: '00839271640', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Wockesha' },
  ],
  'key glock': [
    { writer_name: 'JetsonMade', ipi_number: '00839271640', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Yellow Tape' },
  ],
  'future': [
    { writer_name: 'Southside', ipi_number: '00837261940', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Mask Off' },
    { writer_name: 'ATL Jacob', ipi_number: '00573829164', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Life Is Good' },
  ],
  'gunna': [
    { writer_name: 'Wheezy', ipi_number: '00627384910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Drip Too Hard' },
    { writer_name: 'ATL Jacob', ipi_number: '00573829164', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Yosemite' },
  ],
}

function getDemoResult(artistName: string) {
  const key = artistName.toLowerCase().trim()
  const writers = DEMO_WRITERS[key] || DEMO_WRITERS['default']
  const songsScanned = 10 + Math.floor(artistName.length % 8)
  return {
    success: true,
    artist: artistName,
    songsScanned,
    leadsFound: writers.length,
    leads: writers.map(w => ({ ...w, associated_artist: artistName })),
    demo: true,
  }
}

// ── POST /api/scan ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { artistName } = await req.json()

  if (!artistName) {
    return NextResponse.json({ error: 'artistName is required' }, { status: 400 })
  }

  // If Soundcharts isn't configured, return demo data immediately
  if (!process.env.SOUNDCHARTS_API_TOKEN) {
    return NextResponse.json(getDemoResult(artistName))
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
    const { artist, songs, leads } = await scanArtistForLeads(artistName)

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
        writers_found: songs.length * 2,
        leads_found: leads.length,
      })
      .eq('id', job.id)

    return NextResponse.json({
      success: true,
      artist: artist.name,
      songsScanned: songs.length,
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
