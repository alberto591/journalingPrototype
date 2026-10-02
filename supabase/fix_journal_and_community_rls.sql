-- ====================================================================
-- TRAVESÍA — FIX RLS POLICIES FOR JOURNAL & COMMUNITY TABLES
-- Canonical File: supabase/fix_journal_and_community_rls.sql
-- Run this script in the Supabase Dashboard SQL Editor
-- ====================================================================

-- 1. JOURNAL SESSIONS (Strict private user isolation)
ALTER TABLE public.journal_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own journal sessions" ON public.journal_sessions;
CREATE POLICY "Users can view own journal sessions"
  ON public.journal_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own journal sessions" ON public.journal_sessions;
CREATE POLICY "Users can insert own journal sessions"
  ON public.journal_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own journal sessions" ON public.journal_sessions;
CREATE POLICY "Users can update own journal sessions"
  ON public.journal_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own journal sessions" ON public.journal_sessions;
CREATE POLICY "Users can delete own journal sessions"
  ON public.journal_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. JOURNAL DRAFTS
ALTER TABLE public.journal_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own journal drafts" ON public.journal_drafts;
CREATE POLICY "Users manage own journal drafts"
  ON public.journal_drafts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. ACTION COMMITMENTS
ALTER TABLE public.action_commitments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own commitments" ON public.action_commitments;
CREATE POLICY "Users can view own commitments"
  ON public.action_commitments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own commitments" ON public.action_commitments;
CREATE POLICY "Users can insert own commitments"
  ON public.action_commitments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own commitments" ON public.action_commitments;
CREATE POLICY "Users can update own commitments"
  ON public.action_commitments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own commitments" ON public.action_commitments;
CREATE POLICY "Users can delete own commitments"
  ON public.action_commitments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. USER EMOTIONS & JOURNAL ENTRIES
ALTER TABLE public.user_emotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own emotions" ON public.user_emotions;
CREATE POLICY "Users can view own emotions"
  ON public.user_emotions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own emotions" ON public.user_emotions;
CREATE POLICY "Users can insert own emotions"
  ON public.user_emotions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own journal entries" ON public.journal_entries;
CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. COMMUNITY POSTS & COMMENTS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts viewable by authenticated" ON public.posts;
CREATE POLICY "Posts viewable by authenticated"
  ON public.posts FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users insert own posts" ON public.posts;
CREATE POLICY "Users insert own posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users and admins manage posts" ON public.posts;
CREATE POLICY "Users and admins manage posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users and admins delete posts" ON public.posts;
CREATE POLICY "Users and admins delete posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments viewable by authenticated" ON public.comments;
CREATE POLICY "Comments viewable by authenticated"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users insert own comments" ON public.comments;
CREATE POLICY "Users insert own comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users and admins delete comments" ON public.comments;
CREATE POLICY "Users and admins delete comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

-- 6. NOTIFICATIONS & PREFERENCES
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
CREATE POLICY "Users manage own notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own preferences" ON public.user_preferences;
CREATE POLICY "Users manage own preferences"
  ON public.user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

