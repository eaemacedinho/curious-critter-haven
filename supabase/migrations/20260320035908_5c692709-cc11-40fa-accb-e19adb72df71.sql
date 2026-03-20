
-- Create agencies table for white-label tenants
CREATE TABLE public.agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  slug text NOT NULL DEFAULT '',
  logo_url text DEFAULT '',
  primary_color text DEFAULT '#6B2BD4',
  accent_color text DEFAULT '#A855F7',
  domain text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(slug)
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies viewable by owner" ON public.agencies
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Agencies insertable" ON public.agencies
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Agencies updatable by owner" ON public.agencies
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

-- Add agency_id to creators (nullable for backwards compat)
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL;

-- Update trigger to also create agency for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_agency_id uuid;
BEGIN
  INSERT INTO public.agencies (owner_id, name, slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Minha Agência'),
    LOWER(REPLACE(REPLACE(COALESCE(NEW.raw_user_meta_data->>'email', NEW.id::text), '@', '-'), '.', '-'))
  )
  RETURNING id INTO new_agency_id;

  INSERT INTO public.creators (user_id, name, handle, agency_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'email', ''),
    new_agency_id
  );

  RETURN NEW;
END;
$$;
