
-- =============================================
-- FIX 1: Remove broad bucket-only INSERT policies (override scoped ones via OR)
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can upload agency assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;

-- =============================================
-- FIX 2: Remove broad DELETE policy on videos (no path restriction)
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can delete own videos" ON storage.objects;

-- Replace with scoped policy
CREATE POLICY "Agency members can delete own videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = current_user_agency_id()::text
  );

-- =============================================
-- FIX 3: Remove broad UPDATE policies (no path restriction)
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can update agency assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own videos" ON storage.objects;

-- Replace with scoped policies
CREATE POLICY "Agency members can update own videos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = current_user_agency_id()::text
  );

-- (agency-assets UPDATE already has scoped policy "Users can update agency-assets in own agency path")

-- =============================================
-- FIX 4: Remove referrals from Realtime publication
-- =============================================
ALTER PUBLICATION supabase_realtime DROP TABLE public.referrals;
