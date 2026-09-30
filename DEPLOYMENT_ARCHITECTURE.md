# TRAVESÍA — Deployment Architecture & Integration Map

> **Production Stack**:
> VERCEL = Application Hosting / CDN
> SUPABASE = Backend / Database / Authentication / Storage / RLS
> ZOOM = External Live Video Meetings

---

## 1. Application Deployment Pipeline

```mermaid
graph TD
    GH[GitHub Repository<br/>branch: main] -->|Automated Webhook| VERCEL[Vercel CI/CD Build Engine]
    VERCEL -->|npm run build<br/>tsc -b && vite build| PROD_DEPLOY[Vercel Edge Production<br/>https://travesia.app]
    
    PROD_DEPLOY -->|SPA Client Routing| BROWSER[End-User Browser / Mobile Web]
    
    BROWSER -->|Direct HTTPS / TLS| SUPABASE[Supabase Production Cloud]
    SUPABASE --> AUTH[Supabase Auth<br/>Sessions & JWTs]
    SUPABASE --> PG[PostgreSQL 15+<br/>Single Source of Truth]
    SUPABASE --> STORAGE[Supabase Storage<br/>Private Video Buckets]
    SUPABASE --> RLS[Row Level Security<br/>Authorization & Privacy]
```

---

## 2. Live Session & Archive Recording Flow

TRAVESÍA is **not** a video-conferencing platform. Zoom hosts all live meetings.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Alberto (Admin / Facilitator)
    actor Member as Active Travesía Member
    participant App as TRAVESÍA Frontend (Vercel)
    participant Zoom as Zoom Video Communications
    participant Storage as Supabase Storage (session-recordings)
    participant DB as PostgreSQL Database

    Note over Admin,Zoom: Phase 1: Live Meeting Setup
    Admin->>Zoom: Creates Zoom Meeting externally
    Admin->>App: Pastes Zoom Join URL in Admin Event Console
    App->>DB: Stores events.meeting_url

    Note over Member,Zoom: Phase 2: Live Meeting Participation
    Member->>App: Clicks "Entrar en Zoom"
    App->>DB: Records join_click (event_attendees.joined_zoom_at)
    App->>Zoom: Opens Zoom meeting in new browser tab

    Note over Admin,Storage: Phase 3: Post-Session Archiving
    Admin->>Zoom: Downloads MP4 recording after session
    Admin->>App: Uploads MP4 to Archive in Admin Console
    App->>Storage: Stores file at session-recordings/{event_id}/recording.mp4
    App->>DB: Inserts session_recordings record with status 'AVAILABLE'

    Note over Member,Storage: Phase 4: Private On-Demand Replay
    Member->>App: Opens /archive and clicks "Ver sesión"
    App->>DB: Checks active membership / trial status
    App->>Storage: Requests signed playback URL (expires in 2h)
    Storage-->>App: Returns temporary signed URL
    App->>Member: Streams video via native HTML5 player
    App->>DB: Tracks replay_opened & replay_completed in analytics_events
```

---

## 3. Technology Stack Boundaries

| Domain | Technology | Role & Boundary | Prohibited Patterns |
|---|---|---|---|
| **Hosting & Edge** | Vercel | Global CDN, SPA delivery, HTTPS termination | No backend server state or cron jobs in hosting layer |
| **Database** | PostgreSQL (Supabase) | Single source of truth for all application data | No fake persistence, no localStorage as primary store |
| **Authentication** | Supabase Auth | Session management, password resets, JWT tokens | No fake or simulated auth state |
| **File Storage** | Supabase Storage | Video recordings, avatars, covers, resources | No public bucket for recordings |
| **Live Conferencing** | Zoom | Video meetings, audio transmission, screen sharing | Do NOT embed Zoom; Do NOT build native video rooms |
| **Client State** | React & TanStack Query | Reactive UI, optimistic mutations, server cache | React state is NOT the source of truth |

---

## 4. Architectural Verification Matrix

- [x] Supabase is the single source of truth for all persistent user data.
- [x] Production code never references `SUPABASE_SERVICE_ROLE_KEY`.
- [x] Journal data is private at the database RLS level.
- [x] Zoom meetings open in a new tab without fake video rooms.
- [x] `session-recordings` bucket is private with signed URL playback.
- [x] SPA routing configured in `vercel.json` to prevent 404 on refresh.
- [x] Dedicated `/health`, `/privacy`, and `/terms` routes available.
- [x] Full automated test suite passes with 100% test success.
