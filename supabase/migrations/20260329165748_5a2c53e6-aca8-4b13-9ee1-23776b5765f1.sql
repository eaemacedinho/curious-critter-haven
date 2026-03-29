
-- Fix: "Users can delete own uploads" has no bucket_id restriction
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;

-- Fix: "Users can update own uploads" has no bucket_id restriction  
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;

-- Replace with scoped policies per bucket
CREATE POLICY "Agency members can delete own agency-assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'agency-assets'
    AND (storage.foldername(name))[1] = current_user_agency_id()::text
  );

CREATE POLICY "Agency members can delete own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = current_user_agency_id()::text
  );

CREATE POLICY "Agency members can delete own covers"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = current_user_agency_id()::text
  );

CREATE POLICY "Agency members can delete own content"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'content'
    AND (storage.foldername(name))[1] = current_user_agency_id()::text
  );
