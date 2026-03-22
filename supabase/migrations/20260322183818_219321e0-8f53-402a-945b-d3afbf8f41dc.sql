-- Hero Reels table for premium video blocks on creator pages
CREATE TABLE public.creator_hero_reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  subtitle text DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  thumbnail_url text DEFAULT '',
  cta_label text DEFAULT '',
  cta_url text DEFAULT '',
  aspect_ratio text NOT NULL DEFAULT '9:16',
  playback_mode text NOT NULL DEFAULT 'autoplay',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.creator_hero_reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hero reels are viewable by everyone"
  ON public.creator_hero_reels FOR SELECT TO public
  USING (true);

CREATE POLICY "Agency members can select hero reels"
  ON public.creator_hero_reels FOR SELECT TO authenticated
  USING (creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id()));

CREATE POLICY "Editors+ can insert hero reels"
  ON public.creator_hero_reels FOR INSERT TO authenticated
  WITH CHECK (
    creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Editors+ can update hero reels"
  ON public.creator_hero_reels FOR UPDATE TO authenticated
  USING (
    creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Admins+ can delete hero reels"
  ON public.creator_hero_reels FOR DELETE TO authenticated
  USING (
    creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin')
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Authenticated users can update own videos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can delete own videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'videos');