-- ====================================================================
-- TRAVESÍA MIGRATION 004: COMPLETE ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
-- Enforces absolute isolation for private user journals, notifications,
-- storage access, membership entitlements, and admin controls.
-- ====================================================================

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.four_week_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. STRICT PRIVACY (PROTECTED BY RLS): JOURNAL SESSIONS & ALL SUBSIDIARIES
-- User A cannot view User B. Admins CANNOT view user journals.
DROP POLICY IF EXISTS "Users can view own journal sessions" ON public.journal_sessions;
CREATE POLICY "Users can view own journal sessions"
  ON public.journal_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own journal sessions" ON public.journal_sessions;
CREATE POLICY "Users can insert own journal sessions"
  ON public.journal_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own journal sessions" ON public.journal_sessions;
CREATE POLICY "Users can update own journal sessions"
  ON public.journal_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own journal sessions" ON public.journal_sessions;
CREATE POLICY "Users can delete own journal sessions"
  ON public.journal_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 3.1 JOURNAL ENTRIES
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.journal_entries;
CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;
CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- 3.2 USER EMOTIONS
DROP POLICY IF EXISTS "Users can view own emotions" ON public.user_emotions;
CREATE POLICY "Users can view own emotions"
  ON public.user_emotions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own emotions" ON public.user_emotions;
CREATE POLICY "Users can insert own emotions"
  ON public.user_emotions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own emotions" ON public.user_emotions;
CREATE POLICY "Users can update own emotions"
  ON public.user_emotions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own emotions" ON public.user_emotions;
CREATE POLICY "Users can delete own emotions"
  ON public.user_emotions FOR DELETE
  USING (auth.uid() = user_id);

-- 3.3 ACTION COMMITMENTS
DROP POLICY IF EXISTS "Users can view own commitments" ON public.action_commitments;
CREATE POLICY "Users can view own commitments"
  ON public.action_commitments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own commitments" ON public.action_commitments;
CREATE POLICY "Users can insert own commitments"
  ON public.action_commitments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own commitments" ON public.action_commitments;
CREATE POLICY "Users can update own commitments"
  ON public.action_commitments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own commitments" ON public.action_commitments;
CREATE POLICY "Users can delete own commitments"
  ON public.action_commitments FOR DELETE
  USING (auth.uid() = user_id);

-- 3.4 JOURNAL DRAFTS
DROP POLICY IF EXISTS "Users manage own journal drafts" ON public.journal_drafts;
CREATE POLICY "Users manage own journal drafts"
  ON public.journal_drafts FOR ALL
  USING (auth.uid() = user_id);

-- 4. NOTIFICATIONS & PREFERENCES (STRICT USER ISOLATION)
DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
CREATE POLICY "Users manage own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own preferences" ON public.user_preferences;
CREATE POLICY "Users manage own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- 5. MEMBERSHIP ACCESS CONTROL
DROP POLICY IF EXISTS "Pricing plans viewable by everyone" ON public.pricing_plans;
CREATE POLICY "Pricing plans viewable by everyone"
  ON public.pricing_plans FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage pricing plans" ON public.pricing_plans;
CREATE POLICY "Admins manage pricing plans"
  ON public.pricing_plans FOR ALL
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users view own membership" ON public.memberships;
CREATE POLICY "Users view own membership"
  ON public.memberships FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage memberships" ON public.memberships;
CREATE POLICY "Admins manage memberships"
  ON public.memberships FOR ALL
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users view own membership events" ON public.membership_events;
CREATE POLICY "Users view own membership events"
  ON public.membership_events FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 6. SESSION RECORDINGS (MEMBERSHIP GATED)
DROP POLICY IF EXISTS "Recordings viewable by active members and admins" ON public.session_recordings;
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

DROP POLICY IF EXISTS "Admins manage session recordings" ON public.session_recordings;
CREATE POLICY "Admins manage session recordings"
  ON public.session_recordings FOR ALL
  USING (public.is_admin(auth.uid()));

-- 7. EVENTS & ATTENDANCE
DROP POLICY IF EXISTS "Events viewable by authenticated users" ON public.events;
CREATE POLICY "Events viewable by authenticated users"
  ON public.events FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage events" ON public.events;
CREATE POLICY "Admins manage events"
  ON public.events FOR ALL
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users manage own event registration" ON public.event_attendees;
CREATE POLICY "Users manage own event registration"
  ON public.event_attendees FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all event attendees" ON public.event_attendees;
CREATE POLICY "Admins view all event attendees"
  ON public.event_attendees FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 8. COMMUNITY & CONTENT
DROP POLICY IF EXISTS "Communities viewable by authenticated" ON public.communities;
CREATE POLICY "Communities viewable by authenticated"
  ON public.communities FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Channels viewable by authenticated" ON public.channels;
CREATE POLICY "Channels viewable by authenticated"
  ON public.channels FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage channels" ON public.channels;
CREATE POLICY "Admins manage channels"
  ON public.channels FOR ALL
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Posts viewable by authenticated" ON public.posts;
CREATE POLICY "Posts viewable by authenticated"
  ON public.posts FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users insert own posts" ON public.posts;
CREATE POLICY "Users insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users and admins manage posts" ON public.posts;
CREATE POLICY "Users and admins manage posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users and admins delete posts" ON public.posts;
CREATE POLICY "Users and admins delete posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Comments viewable by authenticated" ON public.comments;
CREATE POLICY "Comments viewable by authenticated"
  ON public.comments FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users insert own comments" ON public.comments;
CREATE POLICY "Users insert own comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users and admins delete comments" ON public.comments;
CREATE POLICY "Users and admins delete comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Reactions manageable by own user" ON public.post_reactions;
CREATE POLICY "Reactions manageable by own user"
  ON public.post_reactions FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Bookmarks manageable by own user" ON public.bookmarks;
CREATE POLICY "Bookmarks manageable by own user"
  ON public.bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- 9. LESSONS, CURRICULUM & PROMPTS
DROP POLICY IF EXISTS "Lessons viewable by authenticated" ON public.lessons;
CREATE POLICY "Lessons viewable by authenticated"
  ON public.lessons FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Lesson progress manageable by own user" ON public.lesson_progress;
CREATE POLICY "Lesson progress manageable by own user"
  ON public.lesson_progress FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Daily prompts viewable by authenticated" ON public.daily_prompts;
CREATE POLICY "Daily prompts viewable by authenticated"
  ON public.daily_prompts FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Four week cycles viewable by authenticated" ON public.four_week_cycles;
CREATE POLICY "Four week cycles viewable by authenticated"
  ON public.four_week_cycles FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Cycle progress manageable by own user" ON public.cycle_progress;
CREATE POLICY "Cycle progress manageable by own user"
  ON public.cycle_progress FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Books viewable by authenticated" ON public.books;
CREATE POLICY "Books viewable by authenticated"
  ON public.books FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Resources viewable by authenticated" ON public.resources;
CREATE POLICY "Resources viewable by authenticated"
  ON public.resources FOR SELECT
  USING (auth.role() = 'authenticated');

-- 10. BUSINESS & ANALYTICS
DROP POLICY IF EXISTS "Leads insertable by public" ON public.leads;
CREATE POLICY "Leads insertable by public"
  ON public.leads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Leads viewable and manageable by admins" ON public.leads;
CREATE POLICY "Leads viewable and manageable by admins"
  ON public.leads FOR ALL
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Referrals readable by referrer or admin" ON public.referrals;
CREATE POLICY "Referrals readable by referrer or admin"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Referrals insertable by authenticated" ON public.referrals;
CREATE POLICY "Referrals insertable by authenticated"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_user_id);

DROP POLICY IF EXISTS "Daily challenge manageable by own user" ON public.daily_challenge_progress;
CREATE POLICY "Daily challenge manageable by own user"
  ON public.daily_challenge_progress FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Customer interviews manageable by admins" ON public.customer_interviews;
CREATE POLICY "Customer interviews manageable by admins"
  ON public.customer_interviews FOR ALL
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Feedback insertable by own user" ON public.feedback_responses;
CREATE POLICY "Feedback insertable by own user"
  ON public.feedback_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Feedback viewable by own user and admins" ON public.feedback_responses;
CREATE POLICY "Feedback viewable by own user and admins"
  ON public.feedback_responses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Content items manageable by admins" ON public.content_items;
CREATE POLICY "Content items manageable by admins"
  ON public.content_items FOR ALL
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Analytics insertable by anyone" ON public.analytics_events;
CREATE POLICY "Analytics insertable by anyone"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Analytics viewable by admins" ON public.analytics_events;
CREATE POLICY "Analytics viewable by admins"
  ON public.analytics_events FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Email events viewable by admins" ON public.email_events;
CREATE POLICY "Email events viewable by admins"
  ON public.email_events FOR ALL
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Business settings readable by all" ON public.business_settings;
CREATE POLICY "Business settings readable by all"
  ON public.business_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Business settings manageable by admins" ON public.business_settings;
CREATE POLICY "Business settings manageable by admins"
  ON public.business_settings FOR ALL
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin roles manageable by superadmin" ON public.admin_roles;
CREATE POLICY "Admin roles manageable by superadmin"
  ON public.admin_roles FOR ALL
  USING (public.is_admin(auth.uid()));
