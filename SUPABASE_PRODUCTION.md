# TRAVESÍA — Supabase Production Infrastructure Guide

> **Single Source of Truth**: All persistent application data lives in Supabase.
> React state and `localStorage` are strictly non-authoritative caches and temporary UI drafts.

---

## 1. Supabase Project Architecture

- **Platform**: Supabase Managed Cloud (PostgreSQL 15+)
- **Primary Database**: PostgreSQL with extensions `uuid-ossp` and `pgcrypto`
- **Authentication**: Supabase Auth (Email + Password provider)
- **File Storage**: Supabase Storage with Row Level Security (RLS)
- **Authorization**: PostgreSQL Row Level Security (RLS) policies on every user table

---

## 2. Environment Variables Configuration

In Vercel and production deployment, set the following environment variables:

| Variable Name | Environment | Access Level | Description |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Production & Preview | Public Frontend | Dedicated Supabase Project API URL (`https://<project-ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Production & Preview | Public Frontend | Public Anonymous Key (Protected by RLS) |
| `VITE_APP_URL` | Production | Public Frontend | Production Canonical Domain (`https://travesia.app`) |

> [!CAUTION]
> **CRITICAL SECURITY RULE**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend or Vite environment variables (`VITE_*`).
> The service-role key bypasses all Row Level Security and must only be stored in secure backend server functions if strictly required.

---

## 3. Database Schema & Domains

The database is version-controlled via SQL migrations located in `supabase/migrations/`:

1. `20260930000001_initial_schema.sql`: Core profiles, communities, channels, posts, comments, events, lessons, prompts, journals, emotions, and commitments.
2. `20260930000002_memberships_and_business.sql`: Pricing plans, memberships, membership events, leads, referrals, 7-day challenge progress, qualitative interviews, feedback responses, analytics events, and email logs.
3. `20260930000003_storage_and_recordings.sql`: Storage buckets and canonical `session_recordings` table with status workflow.
4. `20260930000004_rls_security_policies.sql`: Complete consolidated Row Level Security policies.

### Canonical Domain Tables:
- **USERS**: `profiles`, `community_members`, `admin_roles`
- **MEMBERSHIP**: `memberships`, `membership_events`, `pricing_plans`
- **JOURNAL**: `journal_sessions`, `journal_entries`, `journal_drafts`, `emotions`, `user_emotions`, `action_commitments`
- **JOURNEY**: `four_week_cycles`, `cycle_progress`, `lessons`, `lesson_progress`
- **COMMUNITY**: `communities`, `channels`, `posts`, `comments`, `post_reactions`, `bookmarks`
- **EVENTS**: `events`, `event_attendees`, `session_recordings`
- **CONTENT**: `daily_prompts`, `books`, `resources`, `content_items`
- **BUSINESS & GROWTH**: `leads`, `referrals`, `daily_challenge_progress`, `customer_interviews`, `feedback_responses`, `analytics_events`, `email_events`, `business_settings`
- **NOTIFICATIONS**: `notifications`, `user_preferences`

---

## 4. Supabase Auth Configuration

### 4.1 Automatic Profile Trigger
When a user signs up via Supabase Auth (`auth.users`), the `handle_new_user()` trigger automatically provisions:
1. `public.profiles` row with initial role `'member'` and status `'TRIAL'`.
2. `public.user_preferences` row with default reminder preferences.
3. `public.memberships` row with a 7-day trial period.

### 4.2 Auth Redirect URLs
Configure in **Supabase Dashboard → Authentication → URL Configuration**:
- **Site URL**: `https://travesia.app`
- **Redirect URLs**:
  - `https://travesia.app/**`
  - `https://*.vercel.app/**` (For Vercel preview environments)
  - `http://localhost:5173/**` (For local development only)

---

## 5. Row Level Security (RLS) & Journal Privacy

### 5.1 Strict Journal Privacy
The journal is strictly confidential. RLS guarantees that no user can query, insert, or modify another user's journal:
```sql
CREATE POLICY "Users can view own journal sessions"
  ON public.journal_sessions FOR SELECT
  USING (auth.uid() = user_id);
```
- **Admin Isolation**: Admin users **do not** have bypass privileges to read private journals.
- Terminology: The platform states **"PRIVATE / PROTECTED BY ROW LEVEL SECURITY"** (not "encrypted" unless cryptographic client-side envelope encryption is active).

### 5.2 Membership Access Verification
```sql
CREATE POLICY "Recordings viewable by active members and admins"
  ON public.session_recordings FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND (
      public.is_admin(auth.uid()) 
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND membership_status IN ('ACTIVE', 'TRIAL')
      )
    )
  );
```

---

## 6. Storage Buckets & Policies

| Bucket Name | Public? | Max Size | Allowed MIME Types | Access Policy |
|---|---|---|---|---|
| `profile-images` | Yes | 5 MB | Image (`png`, `jpeg`, `webp`, `gif`) | Public read; Authenticated user can upload/edit only within their folder |
| `session-recordings` | **NO (PRIVATE)** | 5 GB | Video (`mp4`, `mov`, `webm`, `mkv`) | **Strictly Private**. No public select. Access only via temporary signed URLs |
| `book-covers` | Yes | 5 MB | Image (`png`, `jpeg`, `webp`) | Public read; Admin write |
| `resources` | **NO** | 100 MB | PDF, EPUB, Documents | Authenticated member read; Admin write |
| `content-media` | Yes | 50 MB | Image, Video | Public read; Admin write |

### Signed Playback URL Workflow
1. Member clicks "Ver sesión" in Archive.
2. `recordingsService.checkAccess(currentUser, recording)` verifies authenticated session and active membership/trial.
3. Client requests temporary signed URL:
   ```ts
   const { data, error } = await supabase.storage
     .from('session-recordings')
     .createSignedUrl(storagePath, 7200); // 2 hours expiry
   ```
4. HTML5 `<video controls src={signedUrl} />` streams video without exposing raw storage credentials or permanent public links.

---

## 7. Database Backup & Disaster Recovery

### Automated Backups
- **Point-in-Time Recovery (PITR)**: Enable PITR on Supabase Pro production tier (allows continuous restore to any second within 7–14 days).
- **Daily Snapshots**: Automated daily backup snapshots retained for 30 days.

### Manual Backup Procedure
Admins can dump the production schema and data prior to major migrations using the Supabase CLI:
```bash
# Dump complete schema
supabase db dump --project-ref <project-id> -f supabase_schema_backup_$(date +%Y%m%d).sql

# Dump data only (excluding sensitive auth secrets)
supabase db dump --project-ref <project-id> --data-only -f supabase_data_backup_$(date +%Y%m%d).sql
```

---

## 8. Launch Verification Checklist

- [ ] All 4 migration files applied in sequence without errors.
- [ ] RLS enabled on all 36 application tables.
- [ ] Auto-profile trigger `on_auth_user_created` verified on test signup.
- [ ] `session-recordings` bucket verified private (direct unauthenticated HTTP request returns 403 Forbidden).
- [ ] Signed URL generation verified with temporary 7200s token expiration.
- [ ] Test user A unable to select test user B's journal session via database client.
- [ ] PITR / automated backups verified active in Supabase dashboard.
