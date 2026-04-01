import { NextResponse } from 'next/server'
import { searchArtist, getArtistSongs, getSongDetail, fetchRaw } from '@/lib/soundcharts'

// GET /api/soundcharts/test
// Diagnostic endpoint — shows exactly what Soundcharts returns at each step
export async function GET() {
  const appId = process.env.SOUNDCHARTS_APP_ID
  const apiKey = process.env.SOUNDCHARTS_API_TOKEN

  const results: Record<string, unknown> = {
    credentials: {
      app_id_set: !!appId,
      api_key_set: !!apiKey,
      app_id: appId ? `${appId.slice(0, 8)}...` : null,
    },
  }

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'SOUNDCHARTS_API_TOKEN not set',
      results,
    }, { status: 500 })
  }

  try {
    // Step 1: Artist search
    const artists = await searchArtist('Drake', 2)
    results.step1_artist_search = {
      count: artists.length,
      first: artists[0] ?? null,
      raw_shape: artists[0] ? Object.keys(artists[0]) : [],
    }

    if (!artists[0]) {
      return NextResponse.json({ success: false, error: 'Artist search returned nothing', results })
    }

    const artist = artists[0]

    // Step 2: Artist songs
    const songs = await getArtistSongs(artist.uuid, 3)
    results.step2_songs = {
      count: songs.length,
      first: songs[0] ?? null,
      raw_shape: songs[0] ? Object.keys(songs[0]) : [],
    }

    if (!songs[0]) {
      return NextResponse.json({ success: false, error: 'No songs returned', results })
    }

    // Step 3: Try both credits endpoints for first song
    const creditsRaw = await fetchRaw(`/api/v2/song/${songs[0].uuid}/credits`)
    const metadataRaw = await fetchRaw(`/api/v2/song/${songs[0].uuid}/metadata`)

    results.step3_credits_endpoint = creditsRaw
    results.step3_metadata_endpoint = metadataRaw

    // Step 4: Use our normalised getSongDetail
    const detail = await getSongDetail(songs[0].uuid)
    const detailAny = detail as unknown as Record<string, unknown> | null
    results.step4_song_detail = {
      name: detail?.name ?? detail?.title ?? null,
      writers_field: detailAny?.writers ?? null,
      credits_field: detailAny?.credits ?? null,
      contributors_field: detailAny?.contributors ?? null,
      composers_field: detailAny?.composers ?? null,
      all_keys: detail ? Object.keys(detail) : [],
    }

    results.summary = artists[0]
      ? `Connected OK — artist "${artists[0].name}" found, ${songs.length} song(s) fetched`
      : 'Connected but artist search empty'

    return NextResponse.json({ success: true, results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message, results }, { status: 500 })
  }
}
