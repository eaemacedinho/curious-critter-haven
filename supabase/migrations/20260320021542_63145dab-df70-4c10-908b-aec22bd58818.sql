ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS avatar_url_layout2 text DEFAULT '' NULL,
  ADD COLUMN IF NOT EXISTS cover_url_layout2 text DEFAULT '' NULL;