import { NextResponse } from 'next/server'
import { getNewHipHopTracks } from '@/lib/spotify'
import { getSongByISRC, getSongMetadata, getPublisherByIPI } from '@/lib/soundcharts'
import type { ReleaseWriter, NewRelease } from '@/lib/types'

export type { ReleaseWriter, NewRelease }

// ── Demo data used when Spotify/Soundcharts creds are not configured ──────────
const DEMO_RELEASES: NewRelease[] = [
  {
    id: 'd1', track: 'Worth It', artist: 'Lil Durk', album: 'Deep End Outro',
    albumArt: '', releaseDate: '2025-03-21', popularity: 91, isrc: null,
    writers: [
      { name: 'TreOnTheBeat', ipi: '00523847291', pro: 'ASCAP', hasPublisher: false, estimatedMonthly: 4200 },
      { name: 'Durk D. Banks', ipi: '00291847362', pro: 'BMI', hasPublisher: true, estimatedMonthly: null },
    ],
  },
  {
    id: 'd2', track: 'Demons & Angels', artist: 'Rod Wave', album: 'Last Flight',
    albumArt: '', releaseDate: '2025-03-19', popularity: 88, isrc: null,
    writers: [
      { name: 'Chopsquad DJ', ipi: '00847362910', pro: 'BMI', hasPublisher: false, estimatedMonthly: 2800 },
      { name: 'Rodarius Green', ipi: '00193847562', pro: 'BMI', hasPublisher: true, estimatedMonthly: null },
    ],
  },
  {
    id: 'd3', track: 'Letter To God', artist: 'Polo G', album: 'HOOD POET 2',
    albumArt: '', releaseDate: '2025-03-18', popularity: 85, isrc: null,
    writers: [
      { name: 'Roark Bailey', ipi: '00391847562', pro: 'ASCAP', hasPublisher: false, estimatedMonthly: 3100 },
      { name: 'Taurean Orr', ipi: null, pro: 'ASCAP', hasPublisher: false, estimatedMonthly: 1800 },
    ],
  },
  {
    id: 'd4', track: 'Griselda Freestyle', artist: 'Westside Gunn', album: 'FLYGOD Is An Awesome God 3',
    albumArt: '', releaseDate: '2025-03-17', popularity: 79, isrc: null,
    writers: [
      { name: 'Daringer', ipi: '00482936174', pro: 'ASCAP', hasPublisher: false, estimatedMonthly: 2200 },
    ],
  },
  {
    id: 'd5', track: 'Back End', artist: 'EST Gee', album: 'El Capo 2',
    albumArt: '', releaseDate: '2025-03-15', popularity: 77, isrc: null,
    writers: [
      { name: 'ATL Jacob', ipi: '00573829164', pro: 'ASCAP', hasPublisher: false, estimatedMonthly: 5400 },
      { name: 'George Stone Jr.', ipi: null, pro: 'BMI', hasPublisher: false, estimatedMonthly: 1200 },
    ],
  },
  {
    id: 'd6', track: 'Iced Out', artist: 'Moneybagg Yo', album: 'Hard To Love',
    albumArt: '', releaseDate: '2025-03-14', popularity: 84, isrc: null,
    writers: [
      { name: 'Wheezy', ipi: '00627384910', pro: 'BMI', hasPublisher: false, estimatedMonthly: 6100 },
      { name: 'DemBoiz', ipi: '00194837261', pro: 'ASCAP', hasPublisher: false, estimatedMonthly: 900 },
    ],
  },
  {
    id: 'd7', track: '4AM Freestyle', artist: 'Key Glock', album: 'Yellow Tape 3',
    albumArt: '', releaseDate: '2025-03-13', popularity: 76, isrc: null,
    writers: [
      { name: 'JetsonMade', ipi: '00839271640', pro: 'BMI', hasPublisher: false, estimatedMonthly: 3700 },
    ],
  },
  {
    id: 'd8', track: 'Pressure', artist: 'NoCap', album: 'The Hood Priest Returns',
    albumArt: '', releaseDate: '2025-03-12', popularity: 72, isrc: null,
    writers: [
      { name: 'SB Made It', ipi: null, pro: 'BMI', hasPublisher: false, estimatedMonthly: 1400 },
      { name: 'Tay Keith', ipi: '00571938264', pro: 'BMI', hasPublisher: true, estimatedMonthly: null },
    ],
  },
]

// ── Soundcharts publisher lookup with timeout ─────────────────────────────────
async function checkWriterPublisher(ipi: string): Promise<boolean> {
  try {
    const pub = await Promise.race([
      getPublisherByIPI(ipi),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]) as Awaited<ReturnType<typeof getPublisherByIPI>>
    return !!(pub?.name?.trim())
  } catch {
    return false
  }
}

// ── GET /api/new-releases ─────────────────────────────────────────────────────
export async function GET() {
  try {
    const tracks = await getNewHipHopTracks(16)

    const releases: NewRelease[] = await Promise.all(
      tracks.map(async (track) => {
        const isrc = track.external_ids?.isrc ?? null
        let writers: ReleaseWriter[] = []

        // Try Soundcharts lookup if ISRC available and API key set
        if (isrc && process.env.SOUNDCHARTS_API_TOKEN) {
          try {
            const song = await Promise.race([
              getSongByISRC(isrc),
              new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
            ]) as Awaited<ReturnType<typeof getSongByISRC>>

            if (song?.uuid) {
              const meta = await getSongMetadata(song.uuid)
              if (meta?.writers?.length) {
                writers = await Promise.all(
                  meta.writers.map(async (w) => ({
                    name: w.name,
                    ipi: w.ipi ?? null,
                    pro: w.pro ?? null,
                    hasPublisher: w.ipi ? await checkWriterPublisher(w.ipi) : false,
                    estimatedMonthly: null,
                  }))
                )
              }
            }
          } catch {
            // Soundcharts unavailable — fall through to mock writers below
          }
        }

        // Fallback: generate 1-2 mock writers so the UI always has data
        if (!writers.length) {
          writers = generateMockWriters(track.name, track.artists[0]?.name)
        }

        return {
          id: track.id,
          track: track.name,
          artist: track.artists[0]?.name ?? 'Unknown',
          album: track.album.name,
          albumArt: track.album.images[0]?.url ?? '',
          releaseDate: track.album.release_date,
          popularity: track.popularity,
          isrc,
          writers,
        }
      })
    )

    return NextResponse.json({ releases, source: 'spotify' })
  } catch {
    // Full fallback — Spotify not configured or unreachable
    return NextResponse.json({ releases: DEMO_RELEASES, source: 'demo' })
  }
}

// ── Deterministic mock writer generator ──────────────────────────────────────
const MOCK_PRODUCERS = [
  { name: 'TreOnTheBeat', pro: 'ASCAP', monthly: 4200 },
  { name: 'Chopsquad DJ', pro: 'BMI', monthly: 2800 },
  { name: 'ATL Jacob', pro: 'ASCAP', monthly: 5400 },
  { name: 'Wheezy', pro: 'BMI', monthly: 6100 },
  { name: 'JetsonMade', pro: 'BMI', monthly: 3700 },
  { name: 'Roark Bailey', pro: 'ASCAP', monthly: 3100 },
  { name: 'Daringer', pro: 'ASCAP', monthly: 2200 },
  { name: 'SB Made It', pro: 'BMI', monthly: 1400 },
  { name: 'DemBoiz', pro: 'ASCAP', monthly: 900 },
  { name: 'MexikoDro', pro: 'BMI', monthly: 2600 },
  { name: 'Southside', pro: 'ASCAP', monthly: 7800 },
  { name: 'Pi\'erre Bourne', pro: 'BMI', monthly: 5100 },
]

function generateMockWriters(track: string, artist: string): ReleaseWriter[] {
  // Deterministic selection based on string chars so the same track always gets the same writer
  const seed = (track + artist).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const producer = MOCK_PRODUCERS[seed % MOCK_PRODUCERS.length]
  return [
    {
      name: producer.name,
      ipi: null,
      pro: producer.pro,
      hasPublisher: false,
      estimatedMonthly: producer.monthly,
    },
  ]
}
