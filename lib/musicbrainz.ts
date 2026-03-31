/**
 * MusicBrainz API wrapper — no API key required
 * Rate limit: 1 req/sec with a descriptive User-Agent
 */

const MB_BASE = 'https://musicbrainz.org/ws/2'
const UA = 'PulseDashboard/1.0 (music-publishing-tool)'

interface MBArtist {
  id: string
  name: string
  'sort-name': string
  score: number
  country?: string
  disambiguation?: string
}

interface MBRecording {
  id: string
  title: string
  length?: number
  relations?: MBRelation[]
}

interface MBWork {
  id: string
  title: string
  relations?: MBRelation[]
}

interface MBRelation {
  type: string
  direction: string
  artist?: { id: string; name: string; 'sort-name': string }
  label?: { id: string; name: string }
  work?: { id: string; title: string; relations?: MBRelation[] }
}

async function mbFetch(path: string) {
  const res = await fetch(`${MB_BASE}${path}`, {
    headers: {
      'User-Agent': UA,
      Accept: 'application/json',
    },
    next: { revalidate: 3600 },
  })
  if (!res.ok) {
    throw new Error(`MusicBrainz ${res.status}: ${path}`)
  }
  return res.json()
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// Search artists by name — returns top matches sorted by score
export async function mbSearchArtist(name: string): Promise<MBArtist[]> {
  const data = await mbFetch(`/artist?query=${encodeURIComponent(name)}&limit=5&fmt=json`)
  return (data.artists || []).filter((a: MBArtist) => a.score >= 60)
}

// Get recordings for an artist, including work relationships
export async function mbGetArtistRecordings(mbid: string, limit = 8): Promise<MBRecording[]> {
  await sleep(1100)
  const data = await mbFetch(
    `/recording?artist=${mbid}&limit=${limit}&fmt=json&inc=work-rels`
  )
  return data.recordings || []
}

// Get full work detail — includes writer (artist-rels) and publisher (label-rels)
export async function mbGetWork(workMbid: string): Promise<MBWork | null> {
  await sleep(1100)
  try {
    const data = await mbFetch(
      `/work/${workMbid}?fmt=json&inc=artist-rels+label-rels`
    )
    return data
  } catch {
    return null
  }
}

// ── Writer result ─────────────────────────────────────────────────────────────
export interface MBWriterLead {
  writer_name: string
  writer_mbid: string
  song_title: string
  recording_mbid: string
  work_mbid: string | null
  publisher: string | null          // null = no publisher found = lead
  role: string                      // 'composer' | 'lyricist' | 'writer' | 'producer'
  pro: string | null                // inferred from country
  has_publisher: boolean
}

const WRITER_ROLES = new Set([
  'composer', 'lyricist', 'writer', 'music by', 'words by',
  'librettist', 'arranger', 'orchestrator',
])

/**
 * Full scan pipeline for an artist:
 * 1. Search artist by name → get MBID
 * 2. Fetch recordings with work relations
 * 3. For each recording, fetch the work to get writers + publishers
 * 4. Return writers with no publisher listed (potential leads)
 */
export async function mbScanArtist(artistName: string): Promise<{
  artist: MBArtist
  leads: MBWriterLead[]
  songsScanned: number
}> {
  // 1. Find artist
  const artists = await mbSearchArtist(artistName)
  if (!artists.length) {
    throw new Error(`Artist "${artistName}" not found in MusicBrainz`)
  }
  const artist = artists[0]

  // 2. Get recordings
  const recordings = await mbGetArtistRecordings(artist.id, 8)
  if (!recordings.length) {
    throw new Error(`No recordings found for ${artist.name}`)
  }

  const leads: MBWriterLead[] = []
  const seen = new Set<string>() // avoid duplicate writer leads
  let songsScanned = 0

  // 3. For each recording, walk its work-rels
  for (const rec of recordings.slice(0, 6)) {
    const workRels = (rec.relations || []).filter(r => r.work)
    if (!workRels.length) continue

    songsScanned++

    for (const wr of workRels.slice(0, 1)) {
      const workId = wr.work?.id
      if (!workId) continue

      const work = await mbGetWork(workId)
      if (!work) continue

      const workRels2 = work.relations || []

      // Collect publishers on this work
      const publishers = workRels2
        .filter(r => r.label && r.type === 'publisher')
        .map(r => r.label!.name)

      // Collect writers on this work
      const writers = workRels2.filter(
        r => r.artist && WRITER_ROLES.has(r.type.toLowerCase())
      )

      for (const wrel of writers) {
        if (!wrel.artist) continue
        const key = `${wrel.artist.id}:${workId}`
        if (seen.has(key)) continue
        seen.add(key)

        // Check if THIS writer has a publisher listed for this work
        // (Sometimes publisher rels are per-writer, sometimes per-work)
        const writerPublisher = publishers.length > 0 ? publishers[0] : null

        leads.push({
          writer_name: wrel.artist.name,
          writer_mbid: wrel.artist.id,
          song_title: work.title || rec.title,
          recording_mbid: rec.id,
          work_mbid: workId,
          publisher: writerPublisher,
          role: wrel.type,
          pro: null, // PRO can't be determined from MusicBrainz alone
          has_publisher: !!writerPublisher,
        })
      }
    }

    // Respect rate limit — already handled in mbGetWork
  }

  return { artist, leads, songsScanned }
}
