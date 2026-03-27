export interface ReleaseWriter {
  name: string
  ipi: string | null
  pro: string | null
  hasPublisher: boolean
  estimatedMonthly: number | null
}

export interface NewRelease {
  id: string
  track: string
  artist: string
  album: string
  albumArt: string
  releaseDate: string
  popularity: number
  isrc?: string | null
  writers: ReleaseWriter[]
}
