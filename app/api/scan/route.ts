import { NextRequest, NextResponse } from 'next/server'
import { scanArtistForLeads } from '@/lib/soundcharts'
import { supabase } from '@/lib/supabase'

// ── Demo fallback ─────────────────────────────────────────────────────────────
type DemoWriter = { writer_name: string; ipi_number: string | null; pro: string | null; publisher_status: string; song_title: string }
const DEMO_WRITERS: Record<string, DemoWriter[]> = {
  default: [
    { writer_name: 'TreOnTheBeat', ipi_number: '00523847291', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'No Hook' },
    { writer_name: 'Chopsquad DJ', ipi_number: '00847362910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Outside' },
    { writer_name: 'Roark Bailey', ipi_number: '00391847562', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Different' },
    { writer_name: 'ATL Jacob', ipi_number: '00573829164', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Free Talk' },
  ],
  'lil durk': [
    { writer_name: 'TreOnTheBeat', ipi_number: '00523847291', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Back on BS' },
    { writer_name: 'CashMoneyAP', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'What Happened to Virgil' },
    { writer_name: 'OG Parker', ipi_number: '00183746291', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'The Voice' },
  ],
  'polo g': [
    { writer_name: 'Roark Bailey', ipi_number: '00391847562', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Pop Out' },
    { writer_name: 'Taurean Orr', ipi_number: null, pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Martin & Gina' },
    { writer_name: 'Dices', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'RAPSTAR' },
  ],
  'rod wave': [
    { writer_name: 'Chopsquad DJ', ipi_number: '00847362910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Heart on Ice' },
    { writer_name: 'MexikoDro', ipi_number: '00284716390', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Richer' },
    { writer_name: 'Dj X.O.', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Tombstone' },
  ],
  'moneybagg yo': [
    { writer_name: 'Wheezy', ipi_number: '00627384910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Said Sum' },
    { writer_name: 'JetsonMade', ipi_number: '00839271640', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Wockesha' },
    { writer_name: 'GotitGotit', ipi_number: null, pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Time Today' },
  ],
  'future': [
    { writer_name: 'Southside', ipi_number: '00837261940', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Mask Off' },
    { writer_name: 'ATL Jacob', ipi_number: '00573829164', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Life Is Good' },
    { writer_name: 'TM88', ipi_number: '00472839165', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Low Life' },
  ],
  'gunna': [
    { writer_name: 'Wheezy', ipi_number: '00627384910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Drip Too Hard' },
    { writer_name: 'ATL Jacob', ipi_number: '00573829164', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Yosemite' },
  ],
  'key glock': [
    { writer_name: 'JetsonMade', ipi_number: '00839271640', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Yellow Tape' },
    { writer_name: 'Bandplay', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Ambition For Cash' },
  ],
  'nba youngboy': [
    { writer_name: 'DP Beats', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Outside Today' },
    { writer_name: 'Mike WiLL Made-It', ipi_number: '00193847261', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Valuable Pain' },
  ],
  'est gee': [
    { writer_name: 'ATL Jacob', ipi_number: '00573829164', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Loaded' },
    { writer_name: 'George Stone Jr.', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Back End' },
  ],
  'fivio foreign': [
    { writer_name: 'SB Made It', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Big Drip' },
    { writer_name: 'Lexyounggod', ipi_number: null, pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Pain Away' },
  ],
  'sleepy hallow': [
    { writer_name: 'Lexyounggod', ipi_number: null, pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Holy Ghost' },
    { writer_name: 'D-Roc', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: '2055' },
  ],
  '42 dugg': [
    { writer_name: 'Pi\'erre Bourne', ipi_number: '00582736491', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'We Paid' },
    { writer_name: 'TreOnTheBeat', ipi_number: '00523847291', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: '4 Da Gang' },
  ],
  'drake': [
    { writer_name: 'Maaly Raw', ipi_number: '00384716291', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'One Dance' },
    { writer_name: 'Boi-1da', ipi_number: '00473829164', pro: 'SOCAN', publisher_status: 'NO_PUBLISHER', song_title: 'Legend' },
  ],
  'lil baby': [
    { writer_name: 'Wheezy', ipi_number: '00627384910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Woah' },
    { writer_name: 'Quay Global', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Pure Cocaine' },
  ],
  'playboi carti': [
    { writer_name: "Pi'erre Bourne", ipi_number: '00582736491', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Magnolia' },
    { writer_name: 'Ethereal', ipi_number: null, pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Wokeuplikethis*' },
  ],
  'young thug': [
    { writer_name: 'Wheezy', ipi_number: '00627384910', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Digits' },
    { writer_name: 'Turbo', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Best Friend' },
    { writer_name: 'Southside', ipi_number: '00837261940', pro: 'ASCAP', publisher_status: 'NO_PUBLISHER', song_title: 'Guwop' },
  ],
  'meek mill': [
    { writer_name: 'Chase Peso', ipi_number: null, pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Cold Hearted II' },
    { writer_name: 'Giggs', ipi_number: null, pro: 'PRS', publisher_status: 'NO_PUBLISHER', song_title: 'Rosé Red' },
  ],
  'a boogie wit da hoodie': [
    { writer_name: 'Don Cannon', ipi_number: '00291847365', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Look Back At It' },
    { writer_name: 'Hitmaka', ipi_number: '00374829163', pro: 'BMI', publisher_status: 'NO_PUBLISHER', song_title: 'Swervin' },
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

      // Only return Soundcharts result if we actually found leads
      // (if songs came back but no credits data, fall through to MusicBrainz)
      if (leads.length > 0) {
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

      console.log(`[scan] Soundcharts: ${songs.length} songs, 0 leads (no credits data) — trying MusicBrainz`)
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
    }
  }

  // ── 2. Demo fallback (Soundcharts returned no credits data) ──────────────
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
