/**
 * Soundcharts Customer API v2
 * Base: https://customer.api.soundcharts.com
 * Auth: x-app-id + x-api-key headers
 */

const SOUNDCHARTS_BASE = 'https://customer.api.soundcharts.com'
const APP_ID = process.env.SOUNDCHARTS_APP_ID || ''
const API_KEY = process.env.SOUNDCHARTS_API_TOKEN || ''

function getHeaders(): Record<string, string> {
  return {
    'x-app-id': APP_ID,
    'x-api-key': API_KEY,
    'Accept': 'application/json',
  }
}

async function scFetch(path: string) {
  const url = `${SOUNDCHARTS_BASE}${path}`
  const res = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Soundcharts ${res.status} ${res.statusText}: ${path} — ${text.slice(0, 200)}`)
  }
  return res.json()
}

// Try multiple path variants — returns first that succeeds, or throws
async function scFetchFirst(paths: string[]) {
  let lastErr: Error | null = null
  for (const path of paths) {
    try {
      return await scFetch(path)
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastErr
}

export interface SCArtist {
  uuid: string
  name: string
  appUrl?: string
  countryCode?: string
  slug?: string
}

export interface SCSong {
  uuid: string
  name: string
  title?: string
  isrc?: string
  releaseDate?: string
}

// A writer/credit entry as returned by Soundcharts song metadata or credits endpoint
export interface SCWriter {
  name: string
  ipi?: string | null
  pro?: string | null
  // publisher field — may be a string name, an object, or absent
  publisher?: string | { name: string } | null
  role?: string
}

export interface SCSongDetail {
  uuid: string
  name: string
  title?: string
  isrc?: string
  // Various possible shapes Soundcharts returns for credits
  writers?: SCWriter[]
  credits?: SCWriter[]
  contributors?: SCWriter[]
  composers?: SCWriter[]
}

// ── Artist search ─────────────────────────────────────────────────────────────
export async function searchArtist(term: string, limit = 5): Promise<SCArtist[]> {
  const data = await scFetch(`/api/v2/artist/search?term=${encodeURIComponent(term)}&limit=${limit}`)
  // Response may be { items: [] } or { artists: [] } or { data: [] }
  return data.items ?? data.artists ?? data.data ?? []
}

// ── Artist songs ──────────────────────────────────────────────────────────────
export async function getArtistSongs(uuid: string, limit = 20): Promise<SCSong[]> {
  const data = await scFetch(`/api/v2/artist/${encodeURIComponent(uuid)}/songs?limit=${limit}`)
  return data.items ?? data.songs ?? data.data ?? []
}

// ── Song metadata / credits ───────────────────────────────────────────────────
// Tries both /credits and /metadata path variants
export async function getSongDetail(uuid: string): Promise<SCSongDetail | null> {
  try {
    const data = await scFetchFirst([
      `/api/v2/song/${encodeURIComponent(uuid)}/credits`,
      `/api/v2/song/${encodeURIComponent(uuid)}/metadata`,
    ])
    // Normalise: unwrap object/song envelope
    const detail = data.object ?? data.song ?? data.data ?? data
    return detail as SCSongDetail
  } catch {
    return null
  }
}

// Resolve the publisher name from whatever shape SC returns
function resolvePublisher(pub: SCWriter['publisher']): string | null {
  if (!pub) return null
  if (typeof pub === 'string') return pub.trim() || null
  if (typeof pub === 'object' && pub !== null && 'name' in pub) return (pub as { name: string }).name?.trim() || null
  return null
}

// Extract writers from the various field names SC might use
function extractWriters(detail: SCSongDetail): SCWriter[] {
  return detail.writers ?? detail.credits ?? detail.contributors ?? detail.composers ?? []
}

// ── Diagnostic: raw fetch for test endpoint ───────────────────────────────────
export async function fetchRaw(path: string) {
  try {
    const data = await scFetch(path)
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ── Compatibility aliases (used by new-releases route) ───────────────────────
export async function getSongByISRC(isrc: string): Promise<SCSong | null> {
  try {
    const data = await scFetch(`/api/v2/song/by-isrc?isrc=${encodeURIComponent(isrc)}`)
    return data.object ?? data.song ?? data.data ?? null
  } catch {
    return null
  }
}

export async function getSongMetadata(uuid: string): Promise<SCSongDetail | null> {
  return getSongDetail(uuid)
}

export async function getPublisherByIPI(ipi: string): Promise<{ name: string | null } | null> {
  // This endpoint likely doesn't exist in Soundcharts — returns null gracefully
  try {
    const data = await scFetch(`/api/v2/publisher/by-ipi?ipi=${encodeURIComponent(ipi)}`)
    return data.object ?? data.publisher ?? null
  } catch {
    return null
  }
}

// ── Full scan pipeline ────────────────────────────────────────────────────────
export async function scanArtistForLeads(artistName: string) {
  console.log(`[Soundcharts] Scanning "${artistName}"...`)

  // 1. Find artist
  const artists = await searchArtist(artistName, 3)
  if (!artists.length) throw new Error(`Artist not found in Soundcharts: "${artistName}"`)

  const artist = artists[0]
  console.log(`[Soundcharts] Artist: ${artist.name} (${artist.uuid})`)

  // 2. Get songs
  const songs = await getArtistSongs(artist.uuid, 20)
  if (!songs.length) throw new Error(`No songs found for "${artist.name}"`)
  console.log(`[Soundcharts] Songs found: ${songs.length}`)

  const leads: Array<{
    writer_name: string
    ipi_number: string | null
    pro: string | null
    publisher_status: 'NO_PUBLISHER'
    song_title: string
    song_uuid: string
    isrc: string | null
    associated_artist: string
  }> = []

  const seenWriters = new Set<string>()

  // 3. For each song, get credits and find unaffiliated writers
  for (const song of songs.slice(0, 12)) {
    try {
      const detail = await getSongDetail(song.uuid)
      if (!detail) continue

      const writers = extractWriters(detail)
      if (!writers.length) continue

      const songTitle = detail.name ?? detail.title ?? song.name ?? song.title ?? 'Unknown'
      console.log(`[Soundcharts] Song "${songTitle}" — ${writers.length} writer(s)`)

      for (const writer of writers) {
        if (!writer.name) continue
        const key = writer.ipi ?? writer.name.toLowerCase()
        if (seenWriters.has(key)) continue

        const publisher = resolvePublisher(writer.publisher)

        // A writer is a lead if they have NO publisher affiliation
        if (!publisher) {
          seenWriters.add(key)
          leads.push({
            writer_name: writer.name,
            ipi_number: writer.ipi ?? null,
            pro: writer.pro ?? null,
            publisher_status: 'NO_PUBLISHER',
            song_title: songTitle,
            song_uuid: song.uuid,
            isrc: detail.isrc ?? song.isrc ?? null,
            associated_artist: artist.name,
          })
          console.log(`[Soundcharts] LEAD: ${writer.name} — no publisher on "${songTitle}"`)
        } else {
          console.log(`[Soundcharts] SKIP: ${writer.name} — has publisher: ${publisher}`)
        }
      }
    } catch (err) {
      console.error(`[Soundcharts] Error on song ${song.uuid}:`, err instanceof Error ? err.message : err)
    }
  }

  return { artist, songs, leads }
}
