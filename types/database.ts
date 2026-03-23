export type PublisherStatus = 'NO_PUBLISHER' | 'SELF_PUBLISHED' | 'MAJOR' | 'INDIE' | 'UNKNOWN'
export type OutreachStatus = 'PENDING' | 'APPROVED' | 'SENT' | 'OPENED' | 'REPLIED' | 'SKIPPED' | 'SIGNED'
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
export type EmailStatus = 'DRAFT' | 'APPROVED' | 'SENT' | 'OPENED' | 'CLICKED' | 'REPLIED'
export type JobStatus = 'RUNNING' | 'COMPLETED' | 'FAILED' | 'QUEUED'

export interface Producer {
  id: string
  created_at: string
  writer_name: string
  ipi_number: string | null
  pro: string | null
  publisher_status: PublisherStatus
  outreach_status: OutreachStatus
  ai_score: number | null
  priority: Priority | null
  estimated_monthly_royalties: number | null
  instagram: string | null
  email: string | null
  twitter: string | null
  spotify_streams: number | null
  catalog_count: number | null
  associated_artists: string[]
  top_song: string | null
  reasoning: string | null
  notes: string | null
}

export interface Song {
  id: string
  created_at: string
  title: string
  isrc: string | null
  soundcharts_uuid: string | null
  spotify_id: string | null
  artist_name: string
  spotify_streams: number | null
  release_date: string | null
  genre: string | null
}

export interface SongWriter {
  id: string
  song_id: string
  producer_id: string
  writer_share: number | null
}

export interface OutreachEmail {
  id: string
  created_at: string
  producer_id: string
  subject: string
  body: string
  status: EmailStatus
  sent_at: string | null
  opened_at: string | null
  clicked_at: string | null
  replied_at: string | null
  template_used: string | null
  sendgrid_message_id: string | null
}

export interface ScanJob {
  id: string
  created_at: string
  started_at: string | null
  completed_at: string | null
  status: JobStatus
  artist_name: string | null
  songs_scanned: number
  writers_found: number
  leads_found: number
  error_message: string | null
  triggered_by: string
}

export interface ArtistWatchlist {
  id: string
  created_at: string
  artist_name: string
  spotify_id: string | null
  soundcharts_uuid: string | null
  genre: string | null
  is_active: boolean
  last_scanned_at: string | null
}

export interface BeatPack {
  id: string
  created_at: string
  producer_id: string | null
  beat_title: string
  genre: string | null
  bpm: number | null
  key: string | null
  ai_match_score: number | null
  target_artist: string | null
  file_url: string | null
  status: string
}

export interface Database {
  public: {
    Tables: {
      producers: { Row: Producer }
      songs: { Row: Song }
      song_writers: { Row: SongWriter }
      outreach_emails: { Row: OutreachEmail }
      scan_jobs: { Row: ScanJob }
      artist_watchlist: { Row: ArtistWatchlist }
      beat_packs: { Row: BeatPack }
    }
  }
}
