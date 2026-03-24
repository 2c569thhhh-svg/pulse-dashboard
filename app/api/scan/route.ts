import { NextRequest, NextResponse } from 'next/server'
import { scanArtistForLeads } from '@/lib/soundcharts'
import { supabase } from '@/lib/supabase'
import { calculateAIScore, estimateMonthlyRoyalties } from '@/lib/ai-score'

// Demo leads returned when Soundcharts credentials are not configured
function buildDemoLeads(artistName: string) {
  return [
    {
      writer_name: 'Kels',
      ipi_number: '00712934561',
      pro: 'BMI',
      publisher_status: 'NO_PUBLISHER' as const,
      song_title: `${artistName} — Grind Season`,
      isrc: null,
      associated_artist: artistName,
      ai_score: 88,
      priority: 'HIGH' as const,
      estimated_monthly_royalties: 3800,
    },
    {
      writer_name: 'Rome On The Keys',
      ipi_number: '00489203741',
      pro: 'ASCAP',
      publisher_status: 'NO_PUBLISHER' as const,
      song_title: `${artistName} — No Losses`,
      isrc: null,
      associated_artist: artistName,
      ai_score: 76,
      priority: 'HIGH' as const,
      estimated_monthly_royalties: 2400,
    },
    {
      writer_name: 'Chrishan',
      ipi_number: '00631847290',
      pro: 'BMI',
      publisher_status: 'NO_PUBLISHER' as const,
      song_title: `${artistName} — Back At It`,
      isrc: null,
      associated_artist: artistName,
      ai_score: 72,
      priority: 'HIGH' as const,
      estimated_monthly_royalties: 1900,
    },
    {
      writer_name: 'Young Lox',
      ipi_number: '00561829310',
      pro: 'BMI',
      publisher_status: 'SELF_PUBLISHED' as const,
      song_title: `${artistName} — Way Up`,
      isrc: null,
      associated_artist: artistName,
      ai_score: 55,
      priority: 'MEDIUM' as const,
      estimated_monthly_royalties: 1100,
    },
  ]
}

export async function POST(req: NextRequest) {
  const { artistName } = await req.json()

  if (!artistName) {
    return NextResponse.json({ error: 'artistName is required' }, { status: 400 })
  }

  let jobId: string | null = null

  // Try creating a scan job record — non-blocking
  try {
    const { data } = await supabase
      .from('scan_jobs')
      .insert({
        artist_name: artistName,
        status: 'RUNNING',
        started_at: new Date().toISOString(),
        triggered_by: 'api',
      })
      .select()
      .single()
    jobId = data?.id ?? null
  } catch {
    // Supabase not configured — continue without DB
  }

  try {
    // Demo mode when no Soundcharts token is set
    if (!process.env.SOUNDCHARTS_API_TOKEN) {
      const demoLeads = buildDemoLeads(artistName)

      if (jobId) {
        try {
          await supabase
            .from('scan_jobs')
            .update({
              status: 'COMPLETED',
              completed_at: new Date().toISOString(),
              songs_scanned: 10,
              writers_found: 18,
              leads_found: demoLeads.length,
            })
            .eq('id', jobId)
        } catch {}
      }

      return NextResponse.json({
        success: true,
        demo: true,
        artist: artistName,
        songsScanned: 10,
        writersFound: 18,
        leadsFound: demoLeads.length,
        leads: demoLeads,
      })
    }

    // Real Soundcharts scan
    const { artist, songs, leads, writersFound } = await scanArtistForLeads(artistName)

    // Enrich leads with AI scores
    const enrichedLeads = leads.map(lead => {
      const { score, priority } = calculateAIScore({ publisherStatus: lead.publisher_status })
      return {
        ...lead,
        ai_score: score,
        priority,
        estimated_monthly_royalties: estimateMonthlyRoyalties(0),
      }
    })

    // Save leads and update job — non-blocking
    try {
      for (const lead of enrichedLeads) {
        await supabase.from('producers').upsert(
          {
            writer_name: lead.writer_name,
            ipi_number: lead.ipi_number,
            pro: lead.pro,
            publisher_status: lead.publisher_status,
            outreach_status: 'PENDING',
            ai_score: lead.ai_score,
            priority: lead.priority,
            estimated_monthly_royalties: lead.estimated_monthly_royalties,
            associated_artists: [lead.associated_artist],
            top_song: lead.song_title,
          },
          { onConflict: 'ipi_number' }
        )
      }
      if (jobId) {
        await supabase
          .from('scan_jobs')
          .update({
            status: 'COMPLETED',
            completed_at: new Date().toISOString(),
            songs_scanned: songs.length,
            writers_found: writersFound,
            leads_found: enrichedLeads.length,
          })
          .eq('id', jobId)
      }
    } catch {}

    return NextResponse.json({
      success: true,
      artist: artist.name,
      songsScanned: songs.length,
      writersFound,
      leadsFound: enrichedLeads.length,
      leads: enrichedLeads,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    try {
      if (jobId) {
        await supabase
          .from('scan_jobs')
          .update({ status: 'FAILED', completed_at: new Date().toISOString(), error_message: message })
          .eq('id', jobId)
      }
    } catch {}
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data: jobs } = await supabase
      .from('scan_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (jobs) return NextResponse.json({ jobs })
  } catch {}

  const { mockScanJobs } = await import('@/lib/mock-data')
  return NextResponse.json({ jobs: mockScanJobs })
}
