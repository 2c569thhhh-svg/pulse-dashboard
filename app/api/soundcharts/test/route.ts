import { NextResponse } from 'next/server'
import { searchArtist, getArtistSongs, getSongDetail, getWorkByISWC, getPublisherByIPI, fetchRaw } from '@/lib/soundcharts'

// GET /api/soundcharts/test
// Diagnostic: shows exactly what the Soundcharts API returns at each step
export async function GET() {
  const appId = process.env.SOUNDCHARTS_APP_ID
  const apiKey = process.env.SOUNDCHARTS_API_TOKEN

  const results: Record<string, unknown> = {
    credentials: {
      app_id_set: !!appId,
      api_key_set: !!apiKey,
      app_id_preview: appId ? `${appId.slice(0, 10)}...` : null,
    },
  }

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'SOUNDCHARTS_API_TOKEN not set — add it to Vercel environment variables',
      results,
    }, { status: 500 })
  }

  try {
    // Step 1: Artist search (correct path: /api/v2/search/artist?name=...)
    results.step1_raw_search = await fetchRaw('/api/v2/search/artist?name=Drake&limit=2')
    const artists = await searchArtist('Drake', 2)
    results.step1_artist_search = {
      count: artists.length,
      first: artists[0] ?? null,
      keys: artists[0] ? Object.keys(artists[0]) : [],
    }

    if (!artists[0]) {
      return NextResponse.json({ success: false, error: 'Artist search returned nothing', results })
    }

    const artist = artists[0]

    // Step 2: Songs
    const songs = await getArtistSongs(artist.uuid, 3)
    results.step2_songs = {
      count: songs.length,
      first: songs[0] ?? null,
      has_iswc: songs[0] ? 'iswc' in songs[0] : false,
      keys: songs[0] ? Object.keys(songs[0]) : [],
    }

    if (!songs[0]) {
      return NextResponse.json({ success: false, error: 'No songs returned', results })
    }

    // Step 3: Song detail (/api/v2/song/{uuid})
    const detailRaw = await fetchRaw(`/api/v2/song/${songs[0].uuid}`)
    const creditsRaw = await fetchRaw(`/api/v2/song/${songs[0].uuid}/credits`)
    results.step3_song_uuid_endpoint = detailRaw
    results.step3_credits_endpoint = creditsRaw

    const detail = await getSongDetail(songs[0].uuid)
    const iswc = detail?.iswc ?? songs[0].iswc ?? null
    results.step3_song_detail = {
      title: detail?.name ?? detail?.title ?? null,
      isrc: detail?.isrc ?? null,
      iswc,
      all_keys: detail ? Object.keys(detail) : [],
    }

    // Step 4: Work lookup via ISWC (the authoritative writer/publisher layer)
    if (iswc) {
      const workRaw = await fetchRaw(`/api/v2/work/by-iswc/${encodeURIComponent(iswc)}`)
      results.step4_work_by_iswc = workRaw
      const work = await getWorkByISWC(iswc)
      results.step4_work_keys = work ? Object.keys(work) : []
    } else {
      results.step4_work_by_iswc = { note: 'No ISWC on song — work lookup skipped' }
    }

    // Step 5: Publisher by IPI (correct path: /api/v2/publisher/by-ipi/{ipi})
    const testIPI = '00523847291' // TreOnTheBeat (ASCAP registered)
    const pubRaw = await fetchRaw(`/api/v2/publisher/by-ipi/${testIPI}`)
    results.step5_publisher_by_ipi = pubRaw
    const pub = await getPublisherByIPI(testIPI)
    results.step5_publisher_resolved = pub

    return NextResponse.json({
      success: true,
      summary: `Connected — artist "${artist.name}" found, ${songs.length} song(s)`,
      results,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message, results }, { status: 500 })
  }
}
