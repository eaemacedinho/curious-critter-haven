ALTER TABLE public.creators ADD COLUMN font_family text NOT NULL DEFAULT 'default';
ALTER TABLE public.creators ADD COLUMN font_size text NOT NULL DEFAULT 'medium';