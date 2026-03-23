import { NextResponse } from 'next/server'
import { searchArtist, getArtistSongs, getSongByISRC, getSongMetadata, getPublisherByIPI } from '@/lib/soundcharts'

// GET /api/soundcharts/test
// Quick integration test — hits the real Soundcharts API and returns results
export async function GET() {
  const results: Record<string, unknown> = {}

  try {
    // Step 1: Search for Lil Durk
    const artists = await searchArtist('Lil Durk', 1)
    results.artist = artists[0] || null

    if (!artists[0]) {
      return NextResponse.json({ error: 'Artist not found', results })
    }

    // Step 2: Get their songs
    const songs = await getArtistSongs(artists[0].uuid, 5)
    results.songs = songs

    if (!songs[0]) {
      return NextResponse.json({ error: 'No songs found', results })
    }

    // Step 3: Get metadata for first song
    const metadata = await getSongMetadata(songs[0].uuid)
    results.metadata = metadata

    // Step 4: Check publisher for each writer with IPI
    const writerChecks = []
    if (metadata?.writers) {
      for (const writer of metadata.writers.slice(0, 3)) {
        if (writer.ipi) {
          const publisher = await getPublisherByIPI(writer.ipi)
          writerChecks.push({
            writer: writer.name,
            ipi: writer.ipi,
            pro: writer.pro,
            publisher: publisher?.name || null,
            isLead: !publisher?.name,
          })
        }
      }
    }
    results.writerChecks = writerChecks

    const leads = writerChecks.filter(w => w.isLead)
    results.leadsFound = leads.length
    results.summary = `Found ${leads.length} lead(s) on "${metadata?.name}" by ${artists[0].name}`

    return NextResponse.json({ success: true, results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message, results }, { status: 500 })
  }
}
