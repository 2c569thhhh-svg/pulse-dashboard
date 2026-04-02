import { NextResponse } from 'next/server'
import { getNewHipHopTracks } from '@/lib/spotify'
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

// ── GET /api/new-releases ─────────────────────────────────────────────────────
export async function GET() {
  try {
    const tracks = await getNewHipHopTracks(16)

    const releases: NewRelease[] = tracks.map((track) => ({
      id: track.id,
      track: track.name,
      artist: track.artists[0]?.name ?? 'Unknown',
      album: track.album.name,
      albumArt: track.album.images[0]?.url ?? '',
      releaseDate: track.album.release_date,
      popularity: track.popularity,
      isrc: track.external_ids?.isrc ?? null,
      writers: generateMockWriters(track.name, track.artists[0]?.name ?? ''),
    }))

    return NextResponse.json({ releases, source: 'spotify' })
  } catch {
    // Full fallback — Spotify not configured or unreachable
    return NextResponse.json({ releases: DEMO_RELEASES, source: 'demo' })
  }
}

// ── Deterministic mock writer generator ──────────────────────────────────────
const MOCK_PRODUCERS: Array<{ name: string; ipi: string | null; pro: string; monthly: number }> = [
  { name: 'TreOnTheBeat', ipi: '00523847291', pro: 'ASCAP', monthly: 4200 },
  { name: 'Chopsquad DJ', ipi: '00847362910', pro: 'BMI', monthly: 2800 },
  { name: 'ATL Jacob', ipi: '00573829164', pro: 'ASCAP', monthly: 5400 },
  { name: 'Wheezy', ipi: '00627384910', pro: 'BMI', monthly: 6100 },
  { name: 'JetsonMade', ipi: '00839271640', pro: 'BMI', monthly: 3700 },
  { name: 'Roark Bailey', ipi: '00391847562', pro: 'ASCAP', monthly: 3100 },
  { name: 'Daringer', ipi: '00482936174', pro: 'ASCAP', monthly: 2200 },
  { name: 'SB Made It', ipi: null, pro: 'BMI', monthly: 1400 },
  { name: 'MexikoDro', ipi: '00284716390', pro: 'BMI', monthly: 2600 },
  { name: 'Southside', ipi: '00837261940', pro: 'ASCAP', monthly: 7800 },
  { name: "Pi'erre Bourne", ipi: '00582736491', pro: 'BMI', monthly: 5100 },
  { name: 'OG Parker', ipi: '00183746291', pro: 'ASCAP', monthly: 4800 },
  { name: 'Hitmaka', ipi: '00374829163', pro: 'BMI', monthly: 3300 },
  { name: 'Mike WiLL Made-It', ipi: '00193847261', pro: 'ASCAP', monthly: 9200 },
  { name: 'Tay Keith', ipi: '00571938264', pro: 'BMI', monthly: 8600 },
  { name: 'Turbo', ipi: null, pro: 'BMI', monthly: 3900 },
  { name: 'TM88', ipi: '00472839165', pro: 'ASCAP', monthly: 4700 },
  { name: 'Maaly Raw', ipi: '00384716291', pro: 'ASCAP', monthly: 5200 },
  { name: 'Bandplay', ipi: null, pro: 'BMI', monthly: 2100 },
  { name: 'DP Beats', ipi: null, pro: 'BMI', monthly: 1800 },
]

function generateMockWriters(track: string, artist: string): ReleaseWriter[] {
  // Deterministic: same track always gets same writer; 30% chance of 2 writers
  const seed = (track + artist).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const primary = MOCK_PRODUCERS[seed % MOCK_PRODUCERS.length]
  const writers: ReleaseWriter[] = [
    {
      name: primary.name,
      ipi: primary.ipi,
      pro: primary.pro,
      hasPublisher: false,
      estimatedMonthly: primary.monthly,
    },
  ]
  // Add a second writer for ~40% of tracks
  if (seed % 5 < 2) {
    const secondary = MOCK_PRODUCERS[(seed + 7) % MOCK_PRODUCERS.length]
    if (secondary.name !== primary.name) {
      writers.push({
        name: secondary.name,
        ipi: secondary.ipi,
        pro: secondary.pro,
        hasPublisher: false,
        estimatedMonthly: secondary.monthly,
      })
    }
  }
  return writers
}
