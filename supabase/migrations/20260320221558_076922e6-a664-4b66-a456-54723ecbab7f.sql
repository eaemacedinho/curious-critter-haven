ALTER TABLE public.agencies ADD COLUMN footer_visible boolean DEFAULT true NOT NULL;
ALTER TABLE public.agencies ADD COLUMN footer_link text DEFAULT '' NOT NULL;