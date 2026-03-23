-- Pulse Dashboard — Full Supabase Schema
-- Run this in Supabase SQL Editor → New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── producers ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS producers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  writer_name TEXT NOT NULL,
  ipi_number TEXT,
  pro TEXT,
  publisher_status TEXT NOT NULL DEFAULT 'UNKNOWN'
    CHECK (publisher_status IN ('NO_PUBLISHER', 'SELF_PUBLISHED', 'MAJOR', 'INDIE', 'UNKNOWN')),
  outreach_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (outreach_status IN ('PENDING', 'APPROVED', 'SENT', 'OPENED', 'REPLIED', 'SKIPPED', 'SIGNED')),
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  estimated_monthly_royalties NUMERIC,
  instagram TEXT,
  email TEXT,
  twitter TEXT,
  spotify_streams BIGINT,
  catalog_count INTEGER DEFAULT 0,
  associated_artists TEXT[] DEFAULT '{}',
  top_song TEXT,
  reasoning TEXT,
  notes TEXT
);

-- ─── songs ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  isrc TEXT UNIQUE,
  soundcharts_uuid TEXT,
  spotify_id TEXT,
  artist_name TEXT NOT NULL,
  spotify_streams BIGINT,
  release_date DATE,
  genre TEXT
);

-- ─── song_writers ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS song_writers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  producer_id UUID REFERENCES producers(id) ON DELETE CASCADE,
  writer_share NUMERIC CHECK (writer_share >= 0 AND writer_share <= 100),
  UNIQUE(song_id, producer_id)
);

-- ─── outreach_emails ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outreach_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  producer_id UUID REFERENCES producers(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'APPROVED', 'SENT', 'OPENED', 'CLICKED', 'REPLIED')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  template_used TEXT,
  sendgrid_message_id TEXT
);

-- ─── scan_jobs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scan_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'QUEUED'
    CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED')),
  artist_name TEXT,
  songs_scanned INTEGER DEFAULT 0,
  writers_found INTEGER DEFAULT 0,
  leads_found INTEGER DEFAULT 0,
  error_message TEXT,
  triggered_by TEXT DEFAULT 'manual'
);

-- ─── artist_watchlist ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artist_watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  artist_name TEXT NOT NULL UNIQUE,
  spotify_id TEXT,
  soundcharts_uuid TEXT,
  genre TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_scanned_at TIMESTAMPTZ
);

-- ─── beat_packs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS beat_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  producer_id UUID REFERENCES producers(id) ON DELETE SET NULL,
  beat_title TEXT NOT NULL,
  genre TEXT,
  bpm INTEGER,
  key TEXT,
  ai_match_score INTEGER CHECK (ai_match_score >= 0 AND ai_match_score <= 100),
  target_artist TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'QUEUED'
    CHECK (status IN ('QUEUED', 'MATCHED', 'SENT', 'DECLINED'))
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_producers_publisher_status ON producers(publisher_status);
CREATE INDEX IF NOT EXISTS idx_producers_outreach_status ON producers(outreach_status);
CREATE INDEX IF NOT EXISTS idx_producers_ai_score ON producers(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_producers_priority ON producers(priority);
CREATE INDEX IF NOT EXISTS idx_songs_isrc ON songs(isrc);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_producer_id ON outreach_emails(producer_id);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_status ON outreach_emails(status);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_status ON scan_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_created_at ON scan_jobs(created_at DESC);

-- ─── Row Level Security (permissive for now) ──────────────────────────────
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_writers ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_packs ENABLE ROW LEVEL SECURITY;

-- Allow all operations with anon key (tighten when auth is added)
CREATE POLICY "Allow all for anon" ON producers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON songs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON song_writers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON outreach_emails FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON scan_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON artist_watchlist FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON beat_packs FOR ALL USING (true) WITH CHECK (true);

-- ─── Seed artist watchlist ───────────────────────────────────────────────────
INSERT INTO artist_watchlist (artist_name, genre) VALUES
  ('Lil Durk', 'Drill'),
  ('Polo G', 'Drill'),
  ('NBA YoungBoy', 'Trap'),
  ('Moneybagg Yo', 'Trap'),
  ('Rod Wave', 'Soul Trap'),
  ('EST Gee', 'Drill'),
  ('Fivio Foreign', 'Brooklyn Drill'),
  ('Sleepy Hallow', 'Brooklyn Drill'),
  ('42 Dugg', 'Detroit Rap'),
  ('Sheff G', 'Brooklyn Drill'),
  ('Gunna', 'Trap'),
  ('Future', 'Trap'),
  ('21 Savage', 'Trap'),
  ('Lil Baby', 'Trap'),
  ('Roddy Ricch', 'West Coast Rap')
ON CONFLICT (artist_name) DO NOTHING;
