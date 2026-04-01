/**
 * Soundcharts Customer API v2
 * Base: https://customer.api.soundcharts.com
 * Auth: x-app-id + x-api-key headers
 *
 * Confirmed endpoints (from official docs/changelog):
 *   GET /api/v2/search/artist?name=&limit=&offset=
 *   GET /api/v2/artist/{uuid}/songs
 *   GET /api/v2/song/{uuid}
 *   GET /api/v2/song/by-isrc/{isrc}
 *   GET /api/v2/work/{uuid}
 *   GET /api/v2/work/by-iswc/{iswc}
 *   GET /api/v2/publisher/{uuid}
 *   GET /api/v2/publisher/by-ipi/{ipi}
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
    throw new Error(`Soundcharts ${res.status} ${res.statusText}: ${path} — ${text.slice(0, 300)}`)
  }
  return res.json()
}

// Try multiple path variants — returns first that succeeds, or throws last error
async function scFetchFirst(paths: string[]) {
  let lastErr: Error = new Error('No paths provided')
  for (const path of paths) {
    try {
      return await scFetch(path)
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastErr
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SCArtist {
  uuid: string
  name: string
  slug?: string
  appUrl?: string
  countryCode?: string
  countries?: string[]
  ipi?: string
  isni?: string
}

export interface SCSong {
  uuid: string
  name?: string
  title?: string
  isrc?: string
  iswc?: string           // International Standard Musical Work Code — links to Work
  releaseDate?: string
  label?: string
}

export interface SCWork {
  uuid: string
  iswc?: string
  title?: string
  // Composer/writer entries — field names vary; we check multiple
  composers?: SCContributor[]
  writers?: SCContributor[]
  contributors?: SCContributor[]
  // Publisher entries
  publishers?: SCPublisherEntry[]
  label?: SCPublisherEntry
  labels?: SCPublisherEntry[]
}

export interface SCContributor {
  uuid?: string
  name: string
  ipi?: string | null
  pro?: string | null
  role?: string
  publisher?: string | SCPublisherEntry | null
}

export interface SCPublisherEntry {
  uuid?: string
  name: string
  ipi?: string | null
}

export interface SCSongDetail extends SCSong {
  // Various credit field names Soundcharts might use
  writers?: SCContributor[]
  credits?: SCContributor[]
  contributors?: SCContributor[]
  composers?: SCContributor[]
}

// ── Artist search ─────────────────────────────────────────────────────────────
// Correct path: /api/v2/search/artist?name=...
export async function searchArtist(term: string, limit = 5): Promise<SCArtist[]> {
  const data = await scFetchFirst([
    `/api/v2/search/artist?name=${encodeURIComponent(term)}&limit=${limit}`,
    `/api/v2/artist/search?term=${encodeURIComponent(term)}&limit=${limit}`,
  ])
  return data.items ?? data.artists ?? data.data ?? []
}

// ── Artist songs ──────────────────────────────────────────────────────────────
export async function getArtistSongs(uuid: string, limit = 20): Promise<SCSong[]> {
  const data = await scFetch(`/api/v2/artist/${encodeURIComponent(uuid)}/songs?limit=${limit}`)
  return data.items ?? data.songs ?? data.data ?? []
}

// ── Song metadata ─────────────────────────────────────────────────────────────
export async function getSongByISRC(isrc: string): Promise<SCSong | null> {
  try {
    // Correct path: /api/v2/song/by-isrc/{isrc} (path param, not query param)
    const data = await scFetchFirst([
      `/api/v2/song/by-isrc/${encodeURIComponent(isrc)}`,
      `/api/v2/song/by-isrc?isrc=${encodeURIComponent(isrc)}`,
    ])
    return data.object ?? data.song ?? data.data ?? data
  } catch {
    return null
  }
}

export async function getSongMetadata(uuid: string): Promise<SCSongDetail | null> {
  return getSongDetail(uuid)
}

export async function getSongDetail(uuid: string): Promise<SCSongDetail | null> {
  try {
    const data = await scFetchFirst([
      `/api/v2/song/${encodeURIComponent(uuid)}`,
      `/api/v2/song/${encodeURIComponent(uuid)}/credits`,
      `/api/v2/song/${encodeURIComponent(uuid)}/metadata`,
    ])
    return data.object ?? data.song ?? data.data ?? data
  } catch {
    return null
  }
}

// ── Work (composition) lookup ─────────────────────────────────────────────────
// Works contain the authoritative writer/publisher relationships
export async function getWorkByISWC(iswc: string): Promise<SCWork | null> {
  try {
    const data = await scFetch(`/api/v2/work/by-iswc/${encodeURIComponent(iswc)}`)
    return data.object ?? data.work ?? data.data ?? data
  } catch {
    return null
  }
}

export async function getWork(uuid: string): Promise<SCWork | null> {
  try {
    const data = await scFetch(`/api/v2/work/${encodeURIComponent(uuid)}`)
    return data.object ?? data.work ?? data.data ?? data
  } catch {
    return null
  }
}

// ── Publisher lookup by IPI ───────────────────────────────────────────────────
// Correct path: /api/v2/publisher/by-ipi/{ipi} (path param, confirmed in changelog)
export async function getPublisherByIPI(ipi: string): Promise<{ name: string | null; uuid?: string } | null> {
  try {
    const data = await scFetchFirst([
      `/api/v2/publisher/by-ipi/${encodeURIComponent(ipi)}`,
      `/api/v2/publisher/by-ipi?ipi=${encodeURIComponent(ipi)}`,
    ])
    const pub = data.object ?? data.publisher ?? data.data ?? data
    return pub && pub.name ? pub : null
  } catch {
    return null
  }
}

// ── Raw fetch for diagnostic endpoint ────────────────────────────────────────
export async function fetchRaw(path: string) {
  try {
    const data = await scFetch(path)
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ── Extract contributors from whatever field name SC uses ─────────────────────
function extractContributors(obj: Record<string, unknown>): SCContributor[] {
  const candidates = ['writers', 'composers', 'contributors', 'credits']
  for (const key of candidates) {
    const val = obj[key]
    if (Array.isArray(val) && val.length > 0) return val as SCContributor[]
  }
  return []
}

function resolvePublisherName(pub: SCContributor['publisher']): string | null {
  if (!pub) return null
  if (typeof pub === 'string') return pub.trim() || null
  if (typeof pub === 'object' && 'name' in pub) return (pub as SCPublisherEntry).name?.trim() || null
  return null
}

// ── Full scan pipeline ────────────────────────────────────────────────────────
export async function scanArtistForLeads(artistName: string) {
  console.log(`[Soundcharts] Scanning "${artistName}"...`)

  // 1. Find artist
  const artists = await searchArtist(artistName, 3)
  if (!artists.length) throw new Error(`Artist not found in Soundcharts: "${artistName}"`)
  const artist = artists[0]
  console.log(`[Soundcharts] Found: ${artist.name} (${artist.uuid})`)

  // 2. Get songs
  const songs = await getArtistSongs(artist.uuid, 20)
  if (!songs.length) throw new Error(`No songs found for "${artist.name}"`)
  console.log(`[Soundcharts] ${songs.length} songs`)

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

  for (const song of songs.slice(0, 12)) {
    try {
      // 3a. Get song metadata (includes iswc)
      const detail = await getSongDetail(song.uuid)
      const songTitle = detail?.name ?? detail?.title ?? song.name ?? song.title ?? 'Unknown'
      const iswc = detail?.iswc ?? song.iswc ?? null

      let contributors: SCContributor[] = []

      // 3b. If song has ISWC, fetch the Work for authoritative writer/publisher data
      if (iswc) {
        const work = await getWorkByISWC(iswc)
        if (work) {
          const workAny = work as unknown as Record<string, unknown>
          contributors = extractContributors(workAny)
          console.log(`[Soundcharts] Work for "${songTitle}" via ISWC ${iswc}: ${contributors.length} contributor(s)`)
        }
      }

      // 3c. Fallback: use contributors directly from song metadata
      if (!contributors.length && detail) {
        const detailAny = detail as unknown as Record<string, unknown>
        contributors = extractContributors(detailAny)
      }

      if (!contributors.length) continue

      for (const writer of contributors) {
        if (!writer.name) continue
        const key = writer.ipi ?? `${writer.name.toLowerCase()}:${song.uuid}`
        if (seenWriters.has(key)) continue

        // Determine publisher: check writer.publisher first, then look up by IPI
        let publisherName = resolvePublisherName(writer.publisher)

        if (!publisherName && writer.ipi) {
          const pub = await getPublisherByIPI(writer.ipi)
          publisherName = pub?.name ?? null
        }

        if (!publisherName) {
          seenWriters.add(key)
          leads.push({
            writer_name: writer.name,
            ipi_number: writer.ipi ?? null,
            pro: writer.pro ?? null,
            publisher_status: 'NO_PUBLISHER',
            song_title: songTitle,
            song_uuid: song.uuid,
            isrc: detail?.isrc ?? song.isrc ?? null,
            associated_artist: artist.name,
          })
          console.log(`[Soundcharts] LEAD: ${writer.name} (IPI: ${writer.ipi ?? 'none'}) — no publisher on "${songTitle}"`)
        } else {
          console.log(`[Soundcharts] SKIP: ${writer.name} — publisher: ${publisherName}`)
        }
      }
    } catch (err) {
      console.error(`[Soundcharts] Error on song ${song.uuid}:`, err instanceof Error ? err.message : err)
    }
  }

  return { artist, songs, leads }
}
