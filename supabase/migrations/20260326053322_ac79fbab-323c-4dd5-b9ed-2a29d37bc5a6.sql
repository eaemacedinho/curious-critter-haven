-- ============================================================
-- HARDENING MIGRATION: Deterministic multi-tenant + agencies policy
-- ============================================================

-- 1) UNIQUE CONSTRAINT: Enforce single active membership per user
-- This makes current_user_agency_id() deterministic for single-tenant users.
CREATE UNIQUE INDEX IF NOT EXISTS idx_agency_memberships_single_active
  ON public.agency_memberships (user_id)
  WHERE status = 'active';

-- 2) AGENCIES SELECT POLICY: Replace USING (true) with restricted access
DROP POLICY IF EXISTS "agencies_select_public" ON public.agencies;

-- Authenticated users see only their own agency
CREATE POLICY "agencies_select_own"
  ON public.agencies
  FOR SELECT
  TO authenticated
  USING (id = current_user_agency_id());

-- Anon/public can read agency by id (needed for public creator pages)
CREATE POLICY "agencies_select_anon"
  ON public.agencies
  FOR SELECT
  TO anon
  USING (true);

-- 3) STORAGE POLICIES: Restrict uploads by tenant path

-- For agency-assets bucket
DROP POLICY IF EXISTS "Agency members can upload assets" ON storage.objects;
CREATE POLICY "Agency members can upload assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'agency-assets'
    AND (storage.foldername(name))[1] = current_user_agency_id()::text
  );

-- For avatars bucket
DROP POLICY IF EXISTS "Agency members can upload avatars" ON storage.objects;
CREATE POLICY "Agency members can upload avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = current_user_agency_id()::text
  );

-- For covers bucket
DROP POLICY IF EXISTS "Agency members can upload covers" ON storage.objects;
CREATE POLICY "Agency members can upload covers"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = current_user_agency_id()::text
  );

-- For content bucket
DROP POLICY IF EXISTS "Agency members can upload content" ON storage.objects;
CREATE POLICY "Agency members can upload content"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'content'
    AND (storage.foldername(name))[1] = current_user_agency_id()::text
  );

-- For videos bucket
DROP POLICY IF EXISTS "Agency members can upload videos" ON storage.objects;
CREATE POLICY "Agency members can upload videos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = current_user_agency_id()::text
  );

-- Public read for all public buckets
DROP POLICY IF EXISTS "Public read for public buckets" ON storage.objects;
CREATE POLICY "Public read for public buckets"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id IN ('avatars', 'covers', 'content', 'agency-assets', 'videos'));

-- Delete own uploads only
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
CREATE POLICY "Users can delete own uploads"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    (storage.foldername(name))[1] = current_user_agency_id()::text
  );

-- Update own uploads only
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
CREATE POLICY "Users can update own uploads"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    (storage.foldername(name))[1] = current_user_agency_id()::text
  );