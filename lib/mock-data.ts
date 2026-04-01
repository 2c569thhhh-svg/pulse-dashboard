import type { Producer, ScanJob, OutreachEmail, PubIntelligence } from '@/types/database'

export const mockProducers: Producer[] = [
  {
    id: '1',
    created_at: '2024-01-15T10:00:00Z',
    writer_name: 'TreOnTheBeat',
    ipi_number: '00523847291',
    pro: 'ASCAP',
    publisher_status: 'NO_PUBLISHER',
    pub_intelligence: 'TRULY_UNREPRESENTED' as PubIntelligence,
    outreach_status: 'PENDING',
    ai_score: 102, // +15 Prime Target bonus
    priority: 'HIGH',
    estimated_monthly_royalties: 4200,
    instagram: '@treonthebeat',
    email: 'treonthebeat@gmail.com',
    twitter: null,
    spotify_streams: 8400000,
    catalog_count: 14,
    associated_artists: ['Lil Durk', 'EST Gee'],
    top_song: 'Back in Blood',
    reasoning: 'High-stream catalog with no publisher — significant uncollected performance royalties',
    notes: null,
    last_verified_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
    human_verified: true,
    double_verified: true,
    days_in_db: 3,
    opens_count: 0,
  },
  {
    id: '2',
    created_at: '2024-01-16T10:00:00Z',
    writer_name: 'Chopsquad DJ',
    ipi_number: '00847362910',
    pro: 'BMI',
    publisher_status: 'SELF_PUBLISHED',
    pub_intelligence: 'SELF_PUBLISHED_NOT_COLLECTING' as PubIntelligence,
    outreach_status: 'PENDING',
    ai_score: 74,
    priority: 'HIGH',
    estimated_monthly_royalties: 2800,
    instagram: '@chopsquaddj',
    email: null,
    twitter: '@chopsquaddj',
    spotify_streams: 5200000,
    catalog_count: 22,
    associated_artists: ['Polo G', 'G Herbo'],
    top_song: 'Pop Out',
    reasoning: 'Self-published — missing sync and international mechanical royalties',
    notes: null,
    last_verified_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    human_verified: false,
    days_in_db: 8,
    opens_count: 0,
  },
  {
    id: '3',
    created_at: '2024-01-17T10:00:00Z',
    writer_name: 'Roark Bailey',
    ipi_number: '00391847562',
    pro: 'ASCAP',
    publisher_status: 'NO_PUBLISHER',
    pub_intelligence: 'TRULY_UNREPRESENTED' as PubIntelligence,
    outreach_status: 'APPROVED',
    ai_score: 106, // +15 Prime Target bonus
    priority: 'HIGH',
    estimated_monthly_royalties: 6100,
    instagram: '@roarkbailey',
    email: 'roark@beatsbyme.com',
    twitter: null,
    spotify_streams: 12000000,
    catalog_count: 8,
    associated_artists: ['Rod Wave', 'Lil Baby'],
    top_song: 'Heart on Ice',
    reasoning: 'Mega-stream song with no publisher — highest priority lead in pipeline',
    notes: 'Very responsive on Instagram',
    last_verified_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
    human_verified: true,
    double_verified: true,
    days_in_db: 5,
    opens_count: 0,
  },
  {
    id: '4',
    created_at: '2024-01-18T10:00:00Z',
    writer_name: 'D. Hill',
    ipi_number: '00748291037',
    pro: 'BMI',
    publisher_status: 'NO_PUBLISHER',
    pub_intelligence: 'TRULY_UNREPRESENTED' as PubIntelligence,
    outreach_status: 'SENT',
    ai_score: 83, // +15 Prime Target bonus
    priority: 'MEDIUM',
    estimated_monthly_royalties: 1900,
    instagram: '@dhill_music',
    email: 'dhill@protonmail.com',
    twitter: null,
    spotify_streams: 3100000,
    catalog_count: 6,
    associated_artists: ['42 Dugg'],
    top_song: 'Free Me',
    reasoning: 'Solid streams, multiple placements — good candidate for admin deal',
    notes: null,
    last_verified_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    human_verified: false,
    days_in_db: 14,
    opens_count: 0,
  },
  {
    id: '5',
    created_at: '2024-01-19T10:00:00Z',
    writer_name: 'JetsonMade',
    ipi_number: '00293847561',
    pro: 'ASCAP',
    publisher_status: 'NO_PUBLISHER',
    pub_intelligence: 'SELF_COLLECTING' as PubIntelligence,
    outreach_status: 'OPENED',
    ai_score: 82,
    priority: 'HIGH',
    estimated_monthly_royalties: 3500,
    instagram: '@jetsonmade',
    email: null,
    twitter: '@jetsonmade',
    spotify_streams: 7800000,
    catalog_count: 31,
    associated_artists: ['Lil Baby', '21 Savage', 'Gunna'],
    top_song: 'Sold Out Dates',
    reasoning: 'Deep catalog with major artist placements — high lifetime royalty value',
    notes: 'Opened email twice — follow up',
    last_verified_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    human_verified: false,
    days_in_db: 20,
    opens_count: 2,
  },
  {
    id: '6',
    created_at: '2024-01-20T10:00:00Z',
    writer_name: 'Bankroll Got It',
    ipi_number: '00561829374',
    pro: 'BMI',
    publisher_status: 'SELF_PUBLISHED',
    pub_intelligence: 'SELF_PUBLISHED_NOT_COLLECTING' as PubIntelligence,
    outreach_status: 'SKIPPED',
    ai_score: 45,
    priority: 'LOW',
    estimated_monthly_royalties: 800,
    instagram: '@bankrollgotit',
    email: null,
    twitter: null,
    spotify_streams: 1200000,
    catalog_count: 3,
    associated_artists: ['Moneybagg Yo'],
    top_song: 'Said Sum',
    reasoning: 'Low catalog depth limits upside — revisit if they get more placements',
    notes: 'Skipped — too few songs',
    last_verified_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    human_verified: false,
    days_in_db: 32,
    opens_count: 0,
  },
  {
    id: '7',
    created_at: '2024-01-21T10:00:00Z',
    writer_name: 'Wheezy',
    ipi_number: '00192837465',
    pro: 'ASCAP',
    publisher_status: 'NO_PUBLISHER',
    pub_intelligence: 'TRULY_UNREPRESENTED' as PubIntelligence,
    outreach_status: 'REPLIED',
    ai_score: 110, // +15 Prime Target bonus
    priority: 'HIGH',
    estimated_monthly_royalties: 9200,
    instagram: '@wheezy',
    email: 'wheezy@gmail.com',
    twitter: '@wheezyouttahere',
    spotify_streams: 18500000,
    catalog_count: 47,
    associated_artists: ['Future', 'Young Thug', 'Gunna', 'Lil Baby'],
    top_song: 'Drip Too Hard',
    reasoning: 'Highest value lead — massive catalog, top-tier artists, zero publisher coverage',
    notes: 'REPLIED — interested! Schedule call ASAP',
    last_verified_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    human_verified: true,
    double_verified: true,
    days_in_db: 7,
    opens_count: 5,
  },
  {
    id: '8',
    created_at: '2024-01-22T10:00:00Z',
    writer_name: 'MexikoDro',
    ipi_number: '00384756192',
    pro: 'BMI',
    publisher_status: 'NO_PUBLISHER',
    pub_intelligence: 'TRULY_UNREPRESENTED' as PubIntelligence,
    outreach_status: 'PENDING',
    ai_score: 94, // +15 Prime Target bonus
    priority: 'HIGH',
    estimated_monthly_royalties: 3100,
    instagram: '@mexikodro',
    email: 'mexiko@beatsby.me',
    twitter: null,
    spotify_streams: 6400000,
    catalog_count: 19,
    associated_artists: ['Future', '21 Savage'],
    top_song: 'Jersey',
    reasoning: 'Consistent Future collaborator — valuable catalog with no publisher protection',
    notes: null,
    last_verified_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
    human_verified: true,
    days_in_db: 2,
    opens_count: 0,
  },
  {
    id: '9',
    created_at: '2024-01-10T10:00:00Z',
    writer_name: 'DP Beats',
    ipi_number: '00473829104',
    pro: 'ASCAP',
    publisher_status: 'NO_PUBLISHER',
    pub_intelligence: 'TRULY_UNREPRESENTED' as PubIntelligence,
    outreach_status: 'PENDING',
    ai_score: 88,
    priority: 'HIGH',
    estimated_monthly_royalties: 4800,
    instagram: '@dpbeats',
    email: 'dp@beatsbydp.com',
    twitter: null,
    spotify_streams: 9100000,
    catalog_count: 28,
    associated_artists: ['NBA YoungBoy', 'Quando Rondo'],
    top_song: 'Valuable Pain',
    reasoning: 'Long-uncontacted high-value lead — deep NBA YoungBoy catalog with zero publisher coverage',
    notes: null,
    last_verified_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
    human_verified: false,
    days_in_db: 37,
    opens_count: 0,
  },
  {
    id: '10',
    created_at: '2024-01-08T10:00:00Z',
    writer_name: 'Slade Da Monsta',
    ipi_number: '00928473610',
    pro: 'BMI',
    publisher_status: 'SELF_PUBLISHED',
    pub_intelligence: 'SELF_PUBLISHED_NOT_COLLECTING' as PubIntelligence,
    outreach_status: 'PENDING',
    ai_score: 79,
    priority: 'MEDIUM',
    estimated_monthly_royalties: 3200,
    instagram: '@sladedamonsta',
    email: null,
    twitter: '@sladedamonsta',
    spotify_streams: 6700000,
    catalog_count: 15,
    associated_artists: ['Gunna', 'Lil Keed'],
    top_song: 'Dollaz on My Head',
    reasoning: 'Self-published but missing international mechanicals and sync — strong candidate',
    notes: null,
    last_verified_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(), // 32 days ago
    human_verified: false,
    days_in_db: 33,
    opens_count: 0,
  },
]

export const mockScanJobs: ScanJob[] = [
  {
    id: '1',
    created_at: '2024-01-22T08:00:00Z',
    started_at: '2024-01-22T08:00:05Z',
    completed_at: '2024-01-22T08:04:32Z',
    status: 'COMPLETED',
    artist_name: 'Lil Durk',
    songs_scanned: 20,
    writers_found: 34,
    leads_found: 8,
    error_message: null,
    triggered_by: 'manual',
  },
  {
    id: '2',
    created_at: '2024-01-22T09:00:00Z',
    started_at: '2024-01-22T09:00:05Z',
    completed_at: '2024-01-22T09:03:18Z',
    status: 'COMPLETED',
    artist_name: 'Polo G',
    songs_scanned: 20,
    writers_found: 28,
    leads_found: 5,
    error_message: null,
    triggered_by: 'manual',
  },
  {
    id: '3',
    created_at: '2024-01-22T10:00:00Z',
    started_at: '2024-01-22T10:00:05Z',
    completed_at: null,
    status: 'RUNNING',
    artist_name: 'Rod Wave',
    songs_scanned: 12,
    writers_found: 19,
    leads_found: 4,
    error_message: null,
    triggered_by: 'cron',
  },
  {
    id: '4',
    created_at: '2024-01-21T14:00:00Z',
    started_at: '2024-01-21T14:00:05Z',
    completed_at: '2024-01-21T14:06:44Z',
    status: 'COMPLETED',
    artist_name: 'NBA YoungBoy',
    songs_scanned: 20,
    writers_found: 41,
    leads_found: 12,
    error_message: null,
    triggered_by: 'cron',
  },
  {
    id: '5',
    created_at: '2024-01-21T15:30:00Z',
    started_at: '2024-01-21T15:30:05Z',
    completed_at: '2024-01-21T15:31:02Z',
    status: 'FAILED',
    artist_name: 'Future',
    songs_scanned: 3,
    writers_found: 0,
    leads_found: 0,
    error_message: 'Soundcharts rate limit exceeded',
    triggered_by: 'manual',
  },
]

export const mockEmails: OutreachEmail[] = [
  {
    id: '1',
    created_at: '2024-01-20T10:00:00Z',
    producer_id: '5',
    subject: 'Your beat on "Sold Out Dates" — $3,500/mo uncollected',
    body: `Hey JetsonMade,

Quick question — are you collecting your full publishing royalties on "Sold Out Dates"?

I run Reyes Music, a publishing admin company. We pulled your IPI and you have no publisher on record — which means every time that song plays on Spotify, Apple Music, YouTube, or gets licensed, you're only collecting writer's share. The publisher's share is just... gone.

On a song with 7.8M streams, we're talking roughly $3,500/month you're leaving on the table. Every month.

We do admin deals — no upfront cost, you keep your masters, you keep creative control. We handle all the backend: PRO registration, international collections, sync licensing, YouTube ContentID. Standard 15% admin fee, only on what we collect.

I'd love to hop on a 15-minute call and show you exactly what you're missing. No pitch, just data.

— David Reyes
Reyes Music × Raleigh MG
Miami, FL`,
    status: 'OPENED',
    sent_at: '2024-01-20T12:00:00Z',
    opened_at: '2024-01-21T09:15:00Z',
    clicked_at: null,
    replied_at: null,
    template_used: 'uncollected-royalties',
    sendgrid_message_id: 'msg_abc123',
  },
  {
    id: '2',
    created_at: '2024-01-19T10:00:00Z',
    producer_id: '7',
    subject: 'Your beat on "Drip Too Hard" — $9,200/mo uncollected',
    body: `Hey Wheezy,

"Drip Too Hard" is at 18.5M streams and climbing. Your IPI shows no publisher on record.

You're collecting writer's share. The publisher's share — an equal split — is uncollected. On a song this size, that's roughly $9,200 every month.

Reyes Music does publishing admin. No upfront cost. You keep everything. We just collect what's already yours.

15 minutes. I'll pull your full catalog report live.

— David Reyes`,
    status: 'REPLIED',
    sent_at: '2024-01-19T14:00:00Z',
    opened_at: '2024-01-19T16:30:00Z',
    clicked_at: '2024-01-19T16:31:00Z',
    replied_at: '2024-01-20T10:00:00Z',
    template_used: 'uncollected-royalties',
    sendgrid_message_id: 'msg_def456',
  },
  {
    id: '3',
    created_at: '2024-01-18T10:00:00Z',
    producer_id: '4',
    subject: 'Your beat on "Free Me" — $1,900/mo uncollected',
    body: `Hey D. Hill,

Pulled your IPI — no publisher on "Free Me" with 42 Dugg. You're missing about $1,900/month in publisher's share royalties.

Admin deal. No cost. 15% only on collections.

Worth a quick call?

— David`,
    status: 'SENT',
    sent_at: '2024-01-18T15:00:00Z',
    opened_at: null,
    clicked_at: null,
    replied_at: null,
    template_used: 'uncollected-royalties',
    sendgrid_message_id: 'msg_ghi789',
  },
]

export const mockStats = {
  totalLeads: 142,
  highPriority: 38,
  emailsSent: 24,
  openRate: 67,
  replies: 3,
  estimatedAnnualRoyalties: 487000,
  producersSigned: 3,
  songsScanned: 847,
}

// ─── CATALOG MONITORING ───────────────────────────────────────────────────────

export type AlertType = 'COMPETITOR' | 'TRENDING' | 'PLACEMENT' | 'VIRAL' | 'MILESTONE' | 'NEW_RELEASE'

export interface MonitoringAlert {
  id: string
  type: AlertType
  producerName: string
  producerId: string
  title: string
  description: string
  timestampMs: number        // ms ago from now
  read: boolean
  urgency: 'critical' | 'high' | 'medium' | 'low'
  // Extra contextual data
  artist?: string
  song?: string
  streamDelta?: string        // e.g. "+2.1M streams in 48h"
  competitor?: string
  chartPosition?: string
  placementCount?: number
}

export interface WatchedProducer {
  id: string
  name: string
  artists: string[]
  monthlyStreams: number
  streamTrend: number[]       // last 7 data points (sparkline)
  trendDirection: 'up' | 'down' | 'flat'
  trendPct: string            // e.g. "+34%"
  alertsThisWeek: number
  placementsThisMonth: number
  isFirstToWatch: boolean
  signed: boolean             // already signed by this publisher
  watchedSince: string        // relative
  lastActivity: string        // relative
  streakDays?: number         // consecutive days with activity
  streakLabel?: string
}

const now = Date.now()
const minsAgo  = (m: number) => now - m * 60_000
const hoursAgo = (h: number) => now - h * 3_600_000
const daysAgo  = (d: number) => now - d * 86_400_000

export const mockAlerts: MonitoringAlert[] = [
  {
    id: 'a1',
    type: 'COMPETITOR',
    producerName: 'TreOnTheBeat',
    producerId: '1',
    title: 'Competitor Approaching',
    description: 'Warner Chappell rep was seen in contact with TreOnTheBeat\'s manager. Window is closing.',
    timestampMs: minsAgo(14),
    read: false,
    urgency: 'critical',
    artist: 'Lil Durk',
    competitor: 'Warner Chappell',
  },
  {
    id: 'a2',
    type: 'VIRAL',
    producerName: 'Maaly Raw',
    producerId: '3',
    title: 'Going Viral on TikTok',
    description: '"Stick" beat is trending on TikTok — 4.2M video creations in 72h. Stream velocity spiking.',
    timestampMs: minsAgo(47),
    read: false,
    urgency: 'high',
    artist: 'Drake',
    song: 'Stick',
    streamDelta: '+4.2M streams in 72h',
  },
  {
    id: 'a3',
    type: 'PLACEMENT',
    producerName: 'Wheezy',
    producerId: '2',
    title: 'New Major Placement',
    description: 'New placement confirmed on Future\'s upcoming album "MAGIC 3" — tracklist leaked.',
    timestampMs: hoursAgo(2),
    read: false,
    urgency: 'high',
    artist: 'Future',
    song: 'MAGIC 3 (Track 4)',
    placementCount: 8,
  },
  {
    id: 'a4',
    type: 'TRENDING',
    producerName: 'Pi\'erre Bourne',
    producerId: '7',
    title: 'Stream Spike Detected',
    description: 'Playboi Carti\'s "New Tank" trending — catalog streams up 340% in 48h.',
    timestampMs: hoursAgo(3),
    read: false,
    urgency: 'high',
    artist: 'Playboi Carti',
    streamDelta: '+340% in 48h',
  },
  {
    id: 'a5',
    type: 'COMPETITOR',
    producerName: 'DP Beats',
    producerId: '9',
    title: 'Competitor Signed',
    description: 'Sony Music Publishing closed with DP Beats — deal announced this morning. Lead lost.',
    timestampMs: hoursAgo(5),
    read: false,
    urgency: 'critical',
    artist: 'NBA YoungBoy',
    competitor: 'Sony Music Publishing',
  },
  {
    id: 'a6',
    type: 'MILESTONE',
    producerName: 'TreOnTheBeat',
    producerId: '1',
    title: '🏆 500M Streams Milestone',
    description: 'TreOnTheBeat\'s catalog crossed 500M total Spotify streams. Uncollected royalties growing.',
    timestampMs: hoursAgo(8),
    read: true,
    urgency: 'medium',
    streamDelta: '500M total streams',
  },
  {
    id: 'a7',
    type: 'NEW_RELEASE',
    producerName: 'Maaly Raw',
    producerId: '3',
    title: 'New Release Friday',
    description: '2 new Drake collabs dropped — both unregistered with any PRO. Fresh unclaimed royalties.',
    timestampMs: hoursAgo(12),
    read: true,
    urgency: 'medium',
    artist: 'Drake',
    song: 'Nokia / Sticky',
  },
  {
    id: 'a8',
    type: 'PLACEMENT',
    producerName: 'Slade Da Monsta',
    producerId: '10',
    title: 'Gunna Album Confirmation',
    description: '3 placements confirmed on Gunna\'s "a gift & a curse 2". No publishing deal in place.',
    timestampMs: hoursAgo(18),
    read: true,
    urgency: 'high',
    artist: 'Gunna',
    placementCount: 3,
  },
  {
    id: 'a9',
    type: 'TRENDING',
    producerName: 'Pi\'erre Bourne',
    producerId: '7',
    title: 'Billboard Hot 100 Entry',
    description: '"New Tank" enters the Hot 100 at #47. Publishing royalties will accrue this quarter.',
    timestampMs: daysAgo(1),
    read: true,
    urgency: 'low',
    chartPosition: '#47 Hot 100',
  },
  {
    id: 'a10',
    type: 'VIRAL',
    producerName: 'Wheezy',
    producerId: '2',
    title: 'YouTube Trending #3',
    description: 'Future\'s "WAIT FOR U" (prod. Wheezy) hit YouTube Trending #3 — 8.1M views in 24h.',
    timestampMs: daysAgo(2),
    read: true,
    urgency: 'low',
    artist: 'Future',
    streamDelta: '8.1M YouTube views',
  },
]

export const mockWatchedProducers: WatchedProducer[] = [
  {
    id: '1',
    name: 'TreOnTheBeat',
    artists: ['Lil Durk', 'EST Gee', 'Polo G'],
    monthlyStreams: 8_400_000,
    streamTrend: [62, 68, 71, 69, 78, 91, 102],
    trendDirection: 'up',
    trendPct: '+34%',
    alertsThisWeek: 3,
    placementsThisMonth: 5,
    isFirstToWatch: true,
    signed: false,
    watchedSince: '18 days ago',
    lastActivity: '14 min ago',
    streakDays: 12,
    streakLabel: '12-day streak',
  },
  {
    id: '3',
    name: 'Maaly Raw',
    artists: ['Drake', '21 Savage', 'Lil Baby'],
    monthlyStreams: 22_000_000,
    streamTrend: [88, 92, 87, 95, 110, 124, 138],
    trendDirection: 'up',
    trendPct: '+57%',
    alertsThisWeek: 2,
    placementsThisMonth: 3,
    isFirstToWatch: false,
    signed: false,
    watchedSince: '6 days ago',
    lastActivity: '47 min ago',
    streakDays: 6,
    streakLabel: '6-day streak',
  },
  {
    id: '2',
    name: 'Wheezy',
    artists: ['Future', 'Young Thug', 'Drake'],
    monthlyStreams: 31_000_000,
    streamTrend: [95, 98, 94, 100, 97, 103, 108],
    trendDirection: 'up',
    trendPct: '+12%',
    alertsThisWeek: 2,
    placementsThisMonth: 8,
    isFirstToWatch: true,
    signed: false,
    watchedSince: '31 days ago',
    lastActivity: '2h ago',
    streakDays: 31,
    streakLabel: '31-day streak 🔥',
  },
  {
    id: '7',
    name: "Pi'erre Bourne",
    artists: ['Playboi Carti', 'Young Nudy', 'SoFaygo'],
    monthlyStreams: 18_500_000,
    streamTrend: [55, 58, 54, 60, 72, 88, 101],
    trendDirection: 'up',
    trendPct: '+83%',
    alertsThisWeek: 2,
    placementsThisMonth: 4,
    isFirstToWatch: false,
    signed: false,
    watchedSince: '9 days ago',
    lastActivity: '3h ago',
  },
  {
    id: '10',
    name: 'Slade Da Monsta',
    artists: ['Gunna', 'Young Thug'],
    monthlyStreams: 9_200_000,
    streamTrend: [40, 44, 41, 48, 52, 58, 64],
    trendDirection: 'up',
    trendPct: '+28%',
    alertsThisWeek: 1,
    placementsThisMonth: 3,
    isFirstToWatch: true,
    signed: false,
    watchedSince: '33 days ago',
    lastActivity: '18h ago',
    streakDays: 8,
    streakLabel: '8-day streak',
  },
  {
    id: '4',
    name: 'BabyOnTheBeat',
    artists: ['Roddy Ricch', 'Lil Baby'],
    monthlyStreams: 6_100_000,
    streamTrend: [72, 70, 68, 67, 65, 63, 61],
    trendDirection: 'down',
    trendPct: '-15%',
    alertsThisWeek: 0,
    placementsThisMonth: 1,
    isFirstToWatch: false,
    signed: true,   // already signed
    watchedSince: '4 months ago',
    lastActivity: '3 days ago',
  },
]
