-- ====================================================================
-- TRAVESÍA: CREATE PRIVATE STORAGE BUCKET FOR SESSION RECORDINGS
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. Create the private 'session-recordings' bucket (up to 5GB per video)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'session-recordings',
  'session-recordings',
  false,
  5368709120, -- 5GB max file size
  ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5368709120,
  allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];

-- Note: RLS is already enabled by default on storage.objects by Supabase

-- 3. Policy: Administrators have full read/write access to upload & delete recordings
DROP POLICY IF EXISTS "Admins have full access to session recordings storage" ON storage.objects;
CREATE POLICY "Admins have full access to session recordings storage"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'session-recordings'
    AND (
      public.is_admin(auth.uid())
      OR EXISTS (SELECT 1 FROM public.admin_roles ar WHERE ar.user_id = auth.uid())
    )
  );

-- 4. Policy: Authenticated users can read session recordings objects
-- (Required for Supabase signed URL generation to deliver videos to members)
DROP POLICY IF EXISTS "Authenticated users can read session recordings for signed urls" ON storage.objects;
CREATE POLICY "Authenticated users can read session recordings for signed urls"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'session-recordings'
    AND auth.role() = 'authenticated'
  );
