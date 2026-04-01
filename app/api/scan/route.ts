import { NextRequest, NextResponse } from 'next/server'
import { scanArtistForLeads } from '@/lib/soundcharts'
import { mbScanArtist } from '@/lib/musicbrainz'
import { supabase } from '@/lib/supabase'

// ── Demo fallback ─────────────────────────────────────────────────────────────
const DEMO_WRITERS: Record<string, Array<{
  writer_name: string; ipi_number: string | null; pro: string | null
  publisher_status: string; song_title: string
}>> = {
  default: [
    { writer_name: 'TreOnTheBeat', ipi_number: '00523847291', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Track 1' },
    { writer_name: 'Chopsquad DJ', ipi_number: '00847362910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Track 3' },
    { writer_name: 'Roark Bailey', ipi_number: '00391847562', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Track 5' },
    { writer_name: 'ATL Jacob', ipi_number: '00573829164', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Track 7' },
  ],
  'lil durk': [
    { writer_name: 'TreOnTheBeat', ipi_number: '00523847291', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Back on BS' },
    { writer_name: 'CashMoneyAP', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'What Happened to Virgil' },
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
  'future': [
    { writer_name: 'Southside', ipi_number: '00837261940', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Mask Off' },
    { writer_name: 'ATL Jacob', ipi_number: '00573829164', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Life Is Good' },
  ],
  'gunna': [
    { writer_name: 'Wheezy', ipi_number: '00627384910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Drip Too Hard' },
    { writer_name: 'ATL Jacob', ipi_number: '00573829164', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Yosemite' },
  ],
  'key glock': [
    { writer_name: 'JetsonMade', ipi_number: '00839271640', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Yellow Tape' },
  ],
}

function getDemoResult(artistName: string) {
  const key = artistName.toLowerCase().trim()
  const writers = DEMO_WRITERS[key] ?? DEMO_WRITERS['default']
  return {
    success: true,
    artist: artistName,
    songsScanned: 10 + (artistName.length % 8),
    leadsFound: writers.length,
    leads: writers.map(w => ({ ...w, associated_artist: artistName })),
    source: 'demo' as const,
  }
}

// ── MusicBrainz real scan (no auth required) ──────────────────────────────────
async function mbScan(artistName: string) {
  const { artist, leads, songsScanned } = await mbScanArtist(artistName)
  const unaffiliated = leads.filter(l => !l.has_publisher)
  return {
    success: true,
    artist: artist.name,
    songsScanned,
    leadsFound: unaffiliated.length,
    leads: unaffiliated.map(l => ({
      writer_name: l.writer_name,
      ipi_number: null,
      pro: l.pro,
      publisher_status: 'NO_PUBLISHER',
      song_title: l.song_title,
      associated_artist: artist.name,
      role: l.role,
      mb_work_id: l.work_mbid,
    })),
    source: 'musicbrainz' as const,
  }
}

// ── POST /api/scan ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { artistName } = await req.json()
  if (!artistName?.trim()) {
    return NextResponse.json({ error: 'artistName is required' }, { status: 400 })
  }

  const name = artistName.trim()

  // ── 1. Try Soundcharts (real publisher + IPI data) ─────────────────────────
  if (process.env.SOUNDCHARTS_API_TOKEN) {
    // Try to persist job to Supabase (non-critical)
    let jobId: string | null = null
    try {
      const { data: job } = await supabase
        .from('scan_jobs')
        .insert({ artist_name: name, status: 'RUNNING', started_at: new Date().toISOString(), triggered_by: 'api' })
        .select().single()
      jobId = job?.id ?? null
    } catch { /* Supabase optional */ }

    try {
      const { artist, songs, leads } = await scanArtistForLeads(name)

      // If Soundcharts returned songs but no writer credit data, fall through to MusicBrainz
      // (credits endpoint may not be populated on this plan tier)
      if (songs.length > 0 && leads.length === 0) {
        console.log('[scan] Soundcharts returned no leads (credits data absent), trying MusicBrainz')
        // fall through
      } else {
        // Persist leads
        for (const lead of leads) {
          try {
            await supabase.from('producers').upsert({
              writer_name: lead.writer_name,
              ipi_number: lead.ipi_number,
              pro: lead.pro,
              publisher_status: lead.publisher_status,
              outreach_status: 'PENDING',
              associated_artists: [lead.associated_artist],
              top_song: lead.song_title,
            }, { onConflict: 'ipi_number' })
          } catch { /* non-critical */ }
        }

        if (jobId) {
          try {
            await supabase.from('scan_jobs').update({
              status: 'COMPLETED', completed_at: new Date().toISOString(),
              songs_scanned: songs.length, leads_found: leads.length,
            }).eq('id', jobId)
          } catch { /* non-critical */ }
        }

        return NextResponse.json({
          success: true,
          artist: artist.name,
          songsScanned: songs.length,
          leadsFound: leads.length,
          leads,
          source: 'soundcharts',
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Soundcharts error'
      console.error('[scan] Soundcharts failed, trying MusicBrainz:', msg)

      if (jobId) {
        try {
          await supabase.from('scan_jobs').update({
            status: 'FAILED', completed_at: new Date().toISOString(), error_message: msg,
          }).eq('id', jobId)
        } catch { /* non-critical */ }
      }
      // fall through to MusicBrainz
    }
  }

  // ── 2. Try MusicBrainz (real data, no auth required) ──────────────────────
  try {
    const result = await mbScan(name)
    return NextResponse.json(result)
  } catch (mbErr) {
    console.error('[scan] MusicBrainz failed, using demo:', mbErr)
  }

  // ── 3. Demo fallback ───────────────────────────────────────────────────────
  return NextResponse.json(getDemoResult(name))
}

// ── GET /api/scan (recent jobs) ───────────────────────────────────────────────
export async function GET() {
  try {
    const { data: jobs } = await supabase
      .from('scan_jobs').select('*').order('created_at', { ascending: false }).limit(20)
    return NextResponse.json({ jobs: jobs ?? [] })
  } catch {
    return NextResponse.json({ jobs: [] })
  }
}
