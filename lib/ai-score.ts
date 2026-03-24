export function calculateAIScore(params: {
  spotifyStreams?: number | null
  catalogCount?: number | null
  hasEmail?: boolean
  hasInstagram?: boolean
  publisherStatus: string
}): { score: number; priority: 'HIGH' | 'MEDIUM' | 'LOW' } {
  let score = 0

  const streams = params.spotifyStreams || 0
  if (streams >= 5_000_000) score += 40
  else if (streams >= 1_000_000) score += 30
  else if (streams >= 500_000) score += 20
  else if (streams >= 100_000) score += 10

  if (params.publisherStatus === 'NO_PUBLISHER') score += 30
  else if (params.publisherStatus === 'SELF_PUBLISHED') score += 15

  if (params.hasEmail) score += 20
  else if (params.hasInstagram) score += 12

  const catalog = params.catalogCount || 0
  if (catalog >= 10) score += 10
  else if (catalog >= 5) score += 5

  score = Math.min(score, 100)
  const priority: 'HIGH' | 'MEDIUM' | 'LOW' =
    score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW'

  return { score, priority }
}

export function estimateMonthlyRoyalties(spotifyStreams: number): number {
  // Publisher share ~$0.0004/stream, assume ~8% of total are monthly active
  // Add YouTube (~25%), radio (~15%), international (~20%) = 1.6x multiplier
  const base = Math.round(spotifyStreams * 0.08 * 0.0004 * 1.6)
  return Math.max(Math.round(base / 100) * 100, 200)
}
