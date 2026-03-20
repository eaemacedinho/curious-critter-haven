ALTER TABLE public.creator_links ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;
ALTER TABLE public.creator_links ADD COLUMN IF NOT EXISTS display_mode text DEFAULT 'full';