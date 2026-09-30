# TRAVESÍA — Data Architecture & Security Mapping

> **Architecture Principle**: Supabase PostgreSQL is the single source of truth for persistent application data.
> Every user-sensitive domain is protected by PostgreSQL Row Level Security (RLS).

---

## 1. Domain Dependency & Relationship Map

```
USER
  ↓
AUTH (auth.users)
  ↓
PROFILE (public.profiles)
  ↓
MEMBERSHIP (public.memberships, public.membership_events)
  ↓
JOURNEY (public.four_week_cycles, public.cycle_progress, public.lessons, public.lesson_progress)
  ↓
JOURNAL (public.journal_sessions, public.journal_entries, public.journal_drafts, public.action_commitments)
  ↓
COMMUNITY (public.communities, public.channels, public.posts, public.comments, public.reactions)
  ↓
EVENTS (public.events, public.event_attendees)
  ↓
RECORDINGS (public.session_recordings, Supabase Storage: session-recordings)
  ↓
ANALYTICS (public.analytics_events, public.leads, public.referrals, public.email_events)
```

---

## 2. Comprehensive Domain Matrix

### 2.1 AUTH & USERS
- **Table / Location**: `auth.users` & `public.profiles`
- **Data Classification**: Semi-private (Email, Name, Avatar, Role, Streak)
- **Who Can Read**: Authenticated members can read public profile cards (name, avatar, streak). Email is restricted.
- **Who Can Modify**: Only the account owner (`auth.uid() = id`).
- **RLS Policy**:
  - `SELECT`: `auth.role() = 'authenticated'`
  - `UPDATE`: `auth.uid() = id`
- **Trigger**: `on_auth_user_created` automatically creates profile on registration.

---

### 2.2 MEMBERSHIP & PRICING
- **Table / Location**: `public.memberships`, `public.pricing_plans`, `public.membership_events`
- **Data Classification**: Private / Gated
- **Who Can Read**: The member can read their own membership status; Admins can read all memberships; Pricing plans are public.
- **Who Can Modify**: Admins or Stripe webhook server functions via service role.
- **RLS Policy**:
  - `memberships SELECT`: `auth.uid() = user_id OR public.is_admin(auth.uid())`
  - `memberships ALL`: `public.is_admin(auth.uid())`
  - `pricing_plans SELECT`: `true`

---

### 2.3 JOURNAL (RADICAL PRIVACY GUARANTEE)
- **Table / Location**: `public.journal_sessions`, `public.journal_entries`, `public.journal_drafts`, `public.user_emotions`, `public.action_commitments`
- **Data Classification**: **STRICTLY PRIVATE & CONFIDENTIAL**
- **Who Can Read**: **ONLY the owning user (`auth.uid() = user_id`)**.
- **Can Admins Read?**: **NO.** RLS explicitly denies access to admins and coaches.
- **Who Can Modify**: ONLY the owning user.
- **RLS Policy**:
  - `SELECT`: `auth.uid() = user_id`
  - `INSERT`: `auth.uid() = user_id`
  - `UPDATE`: `auth.uid() = user_id`
  - `DELETE`: `auth.uid() = user_id`
- **Storage Rule**: Unfinished session drafts persist in `public.journal_drafts` and temporary client `localStorage`.

---

### 2.4 JOURNEY & FORMACIÓN (4 WEEKS & LESSONS)
- **Table / Location**: `public.four_week_cycles`, `public.cycle_progress`, `public.lessons`, `public.lesson_progress`
- **Data Classification**: Content: Authenticated read; Progress: Private to user
- **Who Can Read**:
  - Cycles & Lessons: All authenticated members
  - Cycle & Lesson Progress: Only owning member (`auth.uid() = user_id`)
- **Who Can Modify**:
  - Progress: Owning member
  - Lessons & Curriculum: Admins only

---

### 2.5 COMMUNITY & CHANNELS
- **Table / Location**: `public.channels`, `public.posts`, `public.comments`, `public.post_reactions`, `public.bookmarks`
- **Data Classification**: Public within Member Sanctuary
- **Who Can Read**: All authenticated members.
- **Who Can Modify**:
  - Posts / Comments: Author (`auth.uid() = author_id`) or Admin.
  - Reactions / Bookmarks: Owning user (`auth.uid() = user_id`).
- **RLS Policy**:
  - `posts INSERT`: `auth.uid() = author_id`
  - `posts UPDATE/DELETE`: `auth.uid() = author_id OR public.is_admin(auth.uid())`

---

### 2.6 EVENTS & ATTENDANCE
- **Table / Location**: `public.events`, `public.event_attendees`
- **Data Classification**: Events: Public to authenticated; Attendees: Protected
- **Who Can Read**:
  - Event details: All authenticated members
  - Attendance & Zoom join clicks: Owning user and Admins
- **Who Can Modify**:
  - Events: Admins only
  - Attendance Registration: Owning user (`auth.uid() = user_id`)
- **Zoom Tracking**: Zoom button clicks are stored in `event_attendees.joined_zoom_at` as `join_click` (distinct from verified attendance).

---

### 2.7 RECORDINGS & ARCHIVE (STORAGE ACCESS)
- **Table / Location**: `public.session_recordings` & Supabase Storage bucket `session-recordings`
- **Data Classification**: **MEMBERSHIP PROTECTED**
- **Who Can Read**:
  - Metadata: Active members (`membership_status IN ('ACTIVE', 'TRIAL')`) and Admins.
  - Video stream: Accessible **only** via temporary signed URLs with 2-hour TTL (`createSignedUrl`).
- **Who Can Modify**: Admins only.
- **Storage Bucket Policy**: Bucket is **PRIVATE** (`public = false`). Direct public HTTP URL access returns `403 Forbidden`.

---

### 2.8 BUSINESS, LEADS & ANALYTICS
- **Table / Location**: `public.leads`, `public.referrals`, `public.customer_interviews`, `public.analytics_events`, `public.email_events`
- **Data Classification**: Internal Business & Operational
- **Who Can Read**: Admins only. Referrals readable by referrer.
- **Who Can Modify**:
  - Leads: Insertable by public landing page (`true`); Manageable by Admins.
  - Analytics Events: Insertable by any visitor or client session (`true`); Viewable by Admins only.
  - Email Logs: System/Admin read-only.

---

## 3. Data Retention & GDPR Policies

| Data Type | Retention Period | Deletion Mechanism |
|---|---|---|
| Account & Profile | Lifetime of account | User self-service delete request or Admin trigger |
| Journal Entries | Lifetime of account | Cascading delete on profile deletion or manual entry delete |
| In-progress Drafts | Active session + 30 days | Auto-cleared on session save or user draft reset |
| Community Posts | Retained while community active | User delete or moderation action |
| Analytics Events | 12 months rolling | Automated database pruning |
| Recording Files | Indefinite archive | Storage object deletion by admin |
