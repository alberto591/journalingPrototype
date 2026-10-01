-- ====================================================================
-- TRAVESÍA MIGRATION 006: CRITICAL SECURITY HARDENING (P0 / P1 / P2)
-- Canonical Migration: 20261001000001_security_hardening.sql
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. PRE-REQUISITE: ENSURE WORKING SUPERADMIN IN public.admin_roles
-- --------------------------------------------------------------------
-- Transfer existing profile admins into admin_roles before locking down is_admin
INSERT INTO public.admin_roles (user_id, role_title, permissions)
SELECT id, 'Superadmin', ARRAY['all']
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

-- Explicitly ensure target founder admin email if found in auth.users
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE LOWER(email) = 'albertocalvorivas@gmail.com' LIMIT 1;
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.admin_roles (user_id, role_title, permissions)
    VALUES (v_admin_id, 'Superadmin', ARRAY['all'])
    ON CONFLICT (user_id) DO NOTHING;

    UPDATE public.profiles
    SET role = 'admin', membership_status = 'ACTIVE'
    WHERE id = v_admin_id;
  END IF;
END $$;

-- --------------------------------------------------------------------
-- 2. HARDEN public.is_admin(user_uid)
-- --------------------------------------------------------------------
-- Must NOT trust profiles.role as source of truth.
-- Authoritative check against public.admin_roles only.
-- Fixed immutable search_path to prevent hijacking.
CREATE OR REPLACE FUNCTION public.is_admin(user_uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF user_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = user_uid
  );
END;
$$;

-- --------------------------------------------------------------------
-- 3. BEFORE UPDATE TRIGGER ON public.profiles (COLUMN TAMPER PROTECTION)
-- --------------------------------------------------------------------
-- For non-admin callers:
-- - role cannot change
-- - membership_status cannot change
-- - streak_days cannot change
-- - billing fields cannot change
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_is_caller_admin BOOLEAN;
BEGIN
  -- If invoked without auth context (e.g. background service_role or trigger), allow
  IF v_caller_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_is_caller_admin := public.is_admin(v_caller_id);

  IF NOT v_is_caller_admin THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Privilege Violation: Only administrators can modify roles.';
    END IF;

    IF NEW.membership_status IS DISTINCT FROM OLD.membership_status THEN
      RAISE EXCEPTION 'Privilege Violation: Only administrators can modify membership status.';
    END IF;

    IF NEW.streak_days IS DISTINCT FROM OLD.streak_days THEN
      RAISE EXCEPTION 'Privilege Violation: streak_days is managed server-side and cannot be manually modified.';
    END IF;

    IF NEW.billing_started_at IS DISTINCT FROM OLD.billing_started_at THEN
      RAISE EXCEPTION 'Privilege Violation: billing_started_at cannot be modified by member.';
    END IF;

    IF NEW.next_billing_date IS DISTINCT FROM OLD.next_billing_date THEN
      RAISE EXCEPTION 'Privilege Violation: next_billing_date cannot be modified by member.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- --------------------------------------------------------------------
-- 4. PROFILES RLS POLICY UPDATES (ADMIN UPDATE & GDPR DELETE)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- --------------------------------------------------------------------
-- 5. DEDICATED SECURITY DEFINER RPC: ADMIN MEMBERSHIP ACTIVATION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_activate_membership(
  target_user_id UUID,
  new_status TEXT DEFAULT 'ACTIVE',
  duration_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_now TIMESTAMPTZ := NOW();
  v_ends_at TIMESTAMPTZ := NOW() + (duration_days || ' days')::INTERVAL;
BEGIN
  IF NOT public.is_admin(v_caller_id) THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can activate or modify member subscriptions.';
  END IF;

  IF new_status NOT IN ('TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;

  UPDATE public.profiles
  SET 
    membership_status = new_status,
    billing_started_at = v_now,
    next_billing_date = v_ends_at,
    updated_at = v_now
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found: %', target_user_id;
  END IF;

  -- Synchronize public.memberships
  INSERT INTO public.memberships (user_id, plan_id, status, started_at, expires_at, current_period_start, current_period_end)
  VALUES (target_user_id, 'founding', new_status, v_now, v_ends_at, v_now, v_ends_at)
  ON CONFLICT (user_id) DO UPDATE SET
    status = EXCLUDED.status,
    started_at = EXCLUDED.started_at,
    expires_at = EXCLUDED.expires_at,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = v_now;

  -- Audit log event
  INSERT INTO public.membership_events (user_id, event_type, metadata)
  VALUES (
    target_user_id,
    'ADMIN_MANUAL_ACTIVATION',
    jsonb_build_object(
      'activated_by', v_caller_id,
      'status', new_status,
      'duration_days', duration_days,
      'ends_at', v_ends_at
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'status', new_status,
    'expires_at', v_ends_at
  );
END;
$$;

-- --------------------------------------------------------------------
-- 6. DEDICATED SECURITY DEFINER RPC: GDPR ACCOUNT DELETION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
BEGIN
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Access Denied: You must be logged in to delete your account.';
  END IF;

  -- Cascades to public.profiles and child tables
  DELETE FROM auth.users WHERE id = v_caller_id;

  RETURN jsonb_build_object('success', true, 'deleted_user_id', v_caller_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user_account(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can delete accounts.';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN jsonb_build_object('success', true, 'deleted_user_id', target_user_id);
END;
$$;

-- --------------------------------------------------------------------
-- 7. HARDEN ALL OTHER SECURITY DEFINER FUNCTIONS (SEARCH PATH LOCK)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- 1. Insert Profile
  INSERT INTO public.profiles (
    id, 
    name, 
    email, 
    avatar_url, 
    role, 
    membership_status,
    current_week, 
    onboarding_completed
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    'member',
    'TRIAL',
    1,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    email = EXCLUDED.email;

  -- 2. Insert User Preferences (Fail-safe)
  BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- 3. Create trial membership record safely (Fail-safe)
  BEGIN
    INSERT INTO public.memberships (user_id, plan_id, status, started_at, expires_at)
    VALUES (NEW.id, 'trial', 'TRIAL', NOW(), NOW() + INTERVAL '7 days')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$$;

-- --------------------------------------------------------------------
-- 8. PII PROTECTION: SECURE EMAIL ACCESS
-- --------------------------------------------------------------------
-- Stored procedure to retrieve email strictly for owner or verified admin
CREATE OR REPLACE FUNCTION public.get_profile_email(target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF auth.uid() = target_user_id OR public.is_admin(auth.uid()) THEN
    RETURN (SELECT email FROM auth.users WHERE id = target_user_id);
  END IF;
  RETURN NULL;
END;
$$;

-- --------------------------------------------------------------------
-- 9. STORAGE POLICY HARDENING: PROFILE IMAGES (PATH ISOLATION)
-- --------------------------------------------------------------------
-- Users can only upload and modify within profile-images/{auth.uid()}/...
DROP POLICY IF EXISTS "Authenticated users can upload own profile image" ON storage.objects;
CREATE POLICY "Authenticated users can upload own profile image"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own profile image" ON storage.objects;
CREATE POLICY "Users can update own profile image"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images' 
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own profile image" ON storage.objects;
CREATE POLICY "Users can delete own profile image"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images' 
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin(auth.uid())
    )
  );

-- --------------------------------------------------------------------
-- 10. STORAGE POLICY HARDENING: SESSION RECORDINGS
-- --------------------------------------------------------------------
-- Admins retain full management. Active & Trial members can read objects to stream.
-- Expired / Cancelled members are strictly denied.
DROP POLICY IF EXISTS "Active and trial members can read session recordings" ON storage.objects;
CREATE POLICY "Active and trial members can read session recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'session-recordings'
    AND auth.role() = 'authenticated'
    AND (
      public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND membership_status IN ('ACTIVE', 'TRIAL')
      )
    )
  );

-- --------------------------------------------------------------------
-- 11. COMPLETE MISSING RLS POLICIES (community_members, lesson_sections, emotions)
-- --------------------------------------------------------------------
-- community_members
DROP POLICY IF EXISTS "Community members viewable by authenticated" ON public.community_members;
CREATE POLICY "Community members viewable by authenticated"
  ON public.community_members FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users manage own community membership" ON public.community_members;
CREATE POLICY "Users manage own community membership"
  ON public.community_members FOR ALL
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- lesson_sections
DROP POLICY IF EXISTS "Lesson sections viewable by authenticated" ON public.lesson_sections;
CREATE POLICY "Lesson sections viewable by authenticated"
  ON public.lesson_sections FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage lesson sections" ON public.lesson_sections;
CREATE POLICY "Admins manage lesson sections"
  ON public.lesson_sections FOR ALL
  USING (public.is_admin(auth.uid()));

-- emotions
DROP POLICY IF EXISTS "Emotions catalog viewable by authenticated" ON public.emotions;
CREATE POLICY "Emotions catalog viewable by authenticated"
  ON public.emotions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage emotions catalog" ON public.emotions;
CREATE POLICY "Admins manage emotions catalog"
  ON public.emotions FOR ALL
  USING (public.is_admin(auth.uid()));

-- email_events (Allow users to log trigger events, admins to view all)
DROP POLICY IF EXISTS "Users can insert own email events" ON public.email_events;
CREATE POLICY "Users can insert own email events"
  ON public.email_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Email events viewable by admins" ON public.email_events;
CREATE POLICY "Email events viewable by admins"
  ON public.email_events FOR ALL
  USING (public.is_admin(auth.uid()));
