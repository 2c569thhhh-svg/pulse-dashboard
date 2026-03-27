const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''

// In-memory token cache (lives for the duration of the serverless function warm instance)
let tokenCache: { token: string; expiresAt: number } | null = null

export async function getSpotifyToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured')
  }

  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`)
  const data = await res.json()

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return tokenCache.token
}

export async function spotifyFetch(path: string) {
  const token = await getSpotifyToken()
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 }, // cache 1hr in Next.js
  })
  if (!res.ok) throw new Error(`Spotify API error ${res.status}`)
  return res.json()
}

export interface SpotifyTrack {
  id: string
  name: string
  popularity: number
  external_ids: { isrc?: string }
  artists: Array<{ id: string; name: string }>
  album: {
    id: string
    name: string
    release_date: string
    images: Array<{ url: string; width: number; height: number }>
  }
}

// Search for new hip-hop tracks released recently
export async function getNewHipHopTracks(limit = 20): Promise<SpotifyTrack[]> {
  // tag:new returns tracks released in the last 2 weeks
  const data = await spotifyFetch(
    `/search?q=genre%3Ahip-hop+tag%3Anew&type=track&limit=${limit}&market=US`
  )
  return data.tracks?.items || []
}
