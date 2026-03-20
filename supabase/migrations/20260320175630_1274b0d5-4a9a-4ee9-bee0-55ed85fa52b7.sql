ALTER TABLE public.creator_links 
  ADD COLUMN bg_color text DEFAULT NULL,
  ADD COLUMN text_color text DEFAULT NULL,
  ADD COLUMN border_color text DEFAULT NULL;

ALTER TABLE public.creator_products 
  ADD COLUMN bg_color text DEFAULT NULL,
  ADD COLUMN text_color text DEFAULT NULL,
  ADD COLUMN border_color text DEFAULT NULL;

ALTER TABLE public.creator_campaigns 
  ADD COLUMN bg_color text DEFAULT NULL,
  ADD COLUMN text_color text DEFAULT NULL,
  ADD COLUMN border_color text DEFAULT NULL;