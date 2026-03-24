const SOUNDCHARTS_BASE = 'https://customer.api.soundcharts.com'
const APP_ID = process.env.SOUNDCHARTS_APP_ID || 'soundcharts'
const API_KEY = process.env.SOUNDCHARTS_API_TOKEN || ''

function getHeaders(): Record<string, string> {
  return {
    'x-app-id': APP_ID,
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  }
}

async function scFetch(path: string) {
  const url = `${SOUNDCHARTS_BASE}${path}`
  const res = await fetch(url, { headers: getHeaders() })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Soundcharts API error ${res.status}: ${text}`)
  }
  return res.json()
}

export interface SCArtist {
  uuid: string
  name: string
  appUrl?: string
  countryCode?: string
}

export interface SCSong {
  uuid: string
  name: string
  isrc?: string
  releaseDate?: string
}

export interface SCSongMetadata {
  uuid: string
  name: string
  isrc?: string
  writers?: Array<{
    name: string
    ipi?: string
    pro?: string
    publisher?: string | null
  }>
}

export interface SCPublisher {
  name: string | null
  ipi?: string
}

// Search artists by name
export async function searchArtist(term: string, limit = 5): Promise<SCArtist[]> {
  const data = await scFetch(`/api/v2/artist/search?term=${encodeURIComponent(term)}&limit=${limit}`)
  return data.items || data.artists || []
}

// Get songs for an artist
export async function getArtistSongs(uuid: string, limit = 20): Promise<SCSong[]> {
  const data = await scFetch(`/api/v2/artist/${uuid}/songs?limit=${limit}`)
  return data.items || data.songs || []
}

// Look up song by ISRC
export async function getSongByISRC(isrc: string): Promise<SCSong | null> {
  const data = await scFetch(`/api/v2/song/by-isrc?isrc=${encodeURIComponent(isrc)}`)
  return data.object || data.song || null
}

// Get song metadata including writers
export async function getSongMetadata(uuid: string): Promise<SCSongMetadata | null> {
  const data = await scFetch(`/api/v2/song/${uuid}/metadata`)
  return data.object || data.song || null
}

// Look up publisher by IPI number — THE MONEY CHECK
export async function getPublisherByIPI(ipi: string): Promise<SCPublisher | null> {
  try {
    const data = await scFetch(`/api/v2/publisher/by-ipi?ipi=${encodeURIComponent(ipi)}`)
    return data.object || data.publisher || null
  } catch {
    return null
  }
}

// Get Spotify top chart
export async function getSpotifyTopChart(genre = 'rap', limit = 50) {
  const data = await scFetch(`/api/v2/chart/spotify/top?genre=${genre}&limit=${limit}`)
  return data.items || data.songs || []
}

// Full pipeline: search artist → get songs → check each writer's publisher status
export async function scanArtistForLeads(artistName: string) {
  console.log(`[Soundcharts] Scanning ${artistName}...`)

  // 1. Find artist
  const artists = await searchArtist(artistName, 1)
  if (!artists.length) {
    throw new Error(`Artist not found: ${artistName}`)
  }
  const artist = artists[0]
  console.log(`[Soundcharts] Found artist: ${artist.name} (${artist.uuid})`)

  // 2. Get their songs
  const songs = await getArtistSongs(artist.uuid, 20)
  console.log(`[Soundcharts] Found ${songs.length} songs`)

  const leads = []
  // Track unique writers (by IPI) across all songs to avoid double-counting
  const seenWriterIPIs = new Set<string>()
  let totalWritersFound = 0

  // 3. For each song, get metadata and check writers
  for (const song of songs.slice(0, 10)) {
    try {
      const metadata = await getSongMetadata(song.uuid)
      if (!metadata?.writers?.length) continue

      for (const writer of metadata.writers) {
        if (!writer.ipi) continue

        // Count unique writers
        if (!seenWriterIPIs.has(writer.ipi)) {
          seenWriterIPIs.add(writer.ipi)
          totalWritersFound++
        }

        const publisher = await getPublisherByIPI(writer.ipi)
        const hasPublisher = publisher && publisher.name && publisher.name.trim() !== ''

        if (!hasPublisher) {
          leads.push({
            writer_name: writer.name,
            ipi_number: writer.ipi,
            pro: writer.pro || null,
            publisher_status: 'NO_PUBLISHER' as const,
            song_title: metadata.name,
            song_uuid: metadata.uuid,
            isrc: metadata.isrc || null,
            associated_artist: artist.name,
          })
          console.log(`[Soundcharts] LEAD FOUND: ${writer.name} — no publisher on "${metadata.name}"`)
        }
      }
    } catch (err) {
      console.error(`[Soundcharts] Error processing song ${song.uuid}:`, err)
    }
  }

  return { artist, songs, leads, writersFound: totalWritersFound }
}
