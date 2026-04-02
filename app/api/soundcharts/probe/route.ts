import { NextResponse } from 'next/server'

const BASE = 'https://customer.api.soundcharts.com'
const HEADERS = {
  'x-app-id': process.env.SOUNDCHARTS_APP_ID || '',
  'x-api-key': process.env.SOUNDCHARTS_API_TOKEN || '',
  'Accept': 'application/json',
}

async function probe(path: string) {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: HEADERS })
    const text = await res.text()
    let json: unknown = null
    try { json = JSON.parse(text) } catch { /* not json */ }
    return { path, status: res.status, ok: res.ok, json: json ?? text.slice(0, 300) }
  } catch (e) {
    return { path, status: 0, ok: false, error: String(e) }
  }
}

// GET /api/soundcharts/probe
// Tests every potentially useful endpoint with this plan's credentials
export async function GET() {
  const appId = process.env.SOUNDCHARTS_APP_ID
  const apiKey = process.env.SOUNDCHARTS_API_TOKEN

  if (!apiKey) {
    return NextResponse.json({ error: 'SOUNDCHARTS_API_TOKEN not set' }, { status: 500 })
  }

  // Known ISRC for "Knife Talk" by Drake (verifiable, real ISRC)
  const testISRC = 'USCM92100692'
  // Known ISWC for "God's Plan" by Drake
  const testISWC = 'T-923.723.762-2'

  const results = await Promise.all([
    // Artist endpoints
    probe('/api/v2/artist/search?term=Drake&limit=1'),
    probe('/api/v2/search/artist?name=Drake&limit=1'),

    // Song endpoints
    probe(`/api/v2/song/by-isrc/${testISRC}`),
    probe(`/api/v2/song/by-isrc?isrc=${testISRC}`),

    // Work endpoints
    probe(`/api/v2/work/by-iswc/${encodeURIComponent(testISWC)}`),

    // Publisher endpoints
    probe('/api/v2/publisher/by-ipi/00523847291'),

    // Chart endpoints
    probe('/api/v2/chart/spotify/top?limit=5'),
    probe('/api/v2/chart/spotify/top/songs?limit=5'),

    // Root / docs
    probe('/api/v2'),
    probe('/api/v2/doc'),
  ])

  const working = results.filter(r => r.ok)
  const blocked = results.filter(r => !r.ok)

  return NextResponse.json({
    credentials: {
      app_id: appId ? `${appId.slice(0, 10)}...` : null,
      api_key_set: !!apiKey,
    },
    summary: `${working.length} working / ${blocked.length} blocked`,
    working,
    blocked: blocked.map(r => ({ path: r.path, status: r.status })),
  })
}
