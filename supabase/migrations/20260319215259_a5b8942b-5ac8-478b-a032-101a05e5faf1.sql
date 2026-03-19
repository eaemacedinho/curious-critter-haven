DO $$
BEGIN
  -- Storage: upload avatars
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload avatars' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own avatars' AND tablename = 'objects') THEN
    CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own avatars' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  -- Storage: upload covers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload covers' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own covers' AND tablename = 'objects') THEN
    CREATE POLICY "Users can update own covers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own covers' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete own covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  -- Delete policies for creator sub-tables
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own links' AND tablename = 'creator_links') THEN
    CREATE POLICY "Users can delete own links" ON public.creator_links FOR DELETE TO authenticated USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own social links' AND tablename = 'creator_social_links') THEN
    CREATE POLICY "Users can delete own social links" ON public.creator_social_links FOR DELETE TO authenticated USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own products' AND tablename = 'creator_products') THEN
    CREATE POLICY "Users can delete own products" ON public.creator_products FOR DELETE TO authenticated USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own campaigns' AND tablename = 'creator_campaigns') THEN
    CREATE POLICY "Users can delete own campaigns" ON public.creator_campaigns FOR DELETE TO authenticated USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));
  END IF;
END $$;