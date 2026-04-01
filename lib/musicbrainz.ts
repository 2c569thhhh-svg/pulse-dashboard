/**
 * MusicBrainz API wrapper — no API key required
 * Rate limit: 1 req/sec; User-Agent must identify the app
 */

const MB_BASE = 'https://musicbrainz.org/ws/2'
const UA = 'PulseDashboard/1.0 (music-publishing-tool; contact@pulsedashboard.com)'

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

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function mbFetch(path: string) {
  const res = await fetch(`${MB_BASE}${path}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    next: { revalidate: 3600 },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`MusicBrainz ${res.status}: ${path} — ${text.slice(0, 100)}`)
  }
  return res.json()
}

// Search artists by name — returns matches with score >= 60
export async function mbSearchArtist(name: string): Promise<MBArtist[]> {
  const data = await mbFetch(`/artist?query=${encodeURIComponent(name)}&limit=5&fmt=json`)
  return (data.artists || []).filter((a: MBArtist) => a.score >= 60)
}

// Get recordings for an artist, including work relationships
export async function mbGetArtistRecordings(mbid: string, limit = 10): Promise<MBRecording[]> {
  await sleep(1100)
  const data = await mbFetch(
    `/recording?artist=${encodeURIComponent(mbid)}&limit=${limit}&fmt=json&inc=work-rels`
  )
  return data.recordings || []
}

// Get full work — includes writer (artist-rels) and publisher (label-rels)
export async function mbGetWork(workMbid: string): Promise<MBWork | null> {
  await sleep(1100)
  try {
    const data = await mbFetch(`/work/${encodeURIComponent(workMbid)}?fmt=json&inc=artist-rels+label-rels`)
    return data
  } catch {
    return null
  }
}

// ── Writer lead result ────────────────────────────────────────────────────────
export interface MBWriterLead {
  writer_name: string
  writer_mbid: string
  song_title: string
  recording_mbid: string
  work_mbid: string | null
  publisher: string | null
  role: string
  pro: string | null
  has_publisher: boolean
}

// Roles that indicate songwriting credit
const WRITER_ROLES = new Set([
  'composer', 'lyricist', 'writer', 'music by', 'words by',
  'librettist', 'arranger', 'orchestrator', 'author',
])

/**
 * Full scan for an artist:
 * 1. Find artist MBID
 * 2. Fetch recordings with work relations
 * 3. For each work, get writers + publishers
 * 4. Return all writers with no publisher = potential leads
 */
export async function mbScanArtist(artistName: string): Promise<{
  artist: MBArtist
  leads: MBWriterLead[]
  songsScanned: number
}> {
  // 1. Find artist
  const artists = await mbSearchArtist(artistName)
  if (!artists.length) throw new Error(`Artist "${artistName}" not found in MusicBrainz`)
  const artist = artists[0]
  console.log(`[MusicBrainz] Found: ${artist.name} (${artist.id})`)

  // 2. Get recordings
  const recordings = await mbGetArtistRecordings(artist.id, 10)
  if (!recordings.length) throw new Error(`No recordings found for "${artist.name}"`)
  console.log(`[MusicBrainz] Recordings: ${recordings.length}`)

  const leads: MBWriterLead[] = []
  const seen = new Set<string>()
  let songsScanned = 0

  // 3. Walk recordings → works → writers
  for (const rec of recordings.slice(0, 8)) {
    const workRels = (rec.relations || []).filter(r => r.work)
    if (!workRels.length) continue

    songsScanned++

    for (const wr of workRels.slice(0, 2)) {
      const workId = wr.work?.id
      if (!workId) continue

      const work = await mbGetWork(workId)
      if (!work) continue

      const rels = work.relations || []

      // All publishers on this work
      const publishers = rels
        .filter(r => r.label && r.type === 'publisher')
        .map(r => r.label!.name)

      // All writers on this work
      const writerRels = rels.filter(
        r => r.artist && WRITER_ROLES.has(r.type.toLowerCase())
      )

      console.log(`[MusicBrainz] "${work.title}" — ${writerRels.length} writer(s), ${publishers.length} publisher(s)`)

      for (const wrel of writerRels) {
        if (!wrel.artist) continue
        const key = `${wrel.artist.id}:${workId}`
        if (seen.has(key)) continue
        seen.add(key)

        const writerPublisher = publishers.length > 0 ? publishers[0] : null

        leads.push({
          writer_name: wrel.artist.name,
          writer_mbid: wrel.artist.id,
          song_title: work.title || rec.title,
          recording_mbid: rec.id,
          work_mbid: workId,
          publisher: writerPublisher,
          role: wrel.type,
          pro: null,
          has_publisher: !!writerPublisher,
        })
      }
    }
  }

  console.log(`[MusicBrainz] Scanned ${songsScanned} songs, found ${leads.length} writer entries`)
  return { artist, leads, songsScanned }
}
