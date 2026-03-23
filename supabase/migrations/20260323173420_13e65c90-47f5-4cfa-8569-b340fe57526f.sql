
-- Add spotify_url to creators
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS spotify_url text DEFAULT '';

-- Create testimonials table
CREATE TABLE public.creator_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT '',
  author_role text DEFAULT '',
  author_avatar_url text DEFAULT '',
  content text NOT NULL DEFAULT '',
  rating integer DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_testimonials ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Testimonials are viewable by everyone"
  ON public.creator_testimonials FOR SELECT TO public USING (true);

-- Agency members can select
CREATE POLICY "Agency members can select testimonials"
  ON public.creator_testimonials FOR SELECT TO authenticated
  USING (creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id()));

-- Editors+ can insert
CREATE POLICY "Editors+ can insert testimonials"
  ON public.creator_testimonials FOR INSERT TO authenticated
  WITH CHECK (
    creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

-- Editors+ can update
CREATE POLICY "Editors+ can update testimonials"
  ON public.creator_testimonials FOR UPDATE TO authenticated
  USING (
    creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin', 'editor')
  );

-- Admins+ can delete
CREATE POLICY "Admins+ can delete testimonials"
  ON public.creator_testimonials FOR DELETE TO authenticated
  USING (
    creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id())
    AND current_user_role() IN ('owner', 'admin')
  );
