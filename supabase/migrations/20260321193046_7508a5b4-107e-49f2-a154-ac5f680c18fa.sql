-- PHASE 1: Rename creator_campaigns → campaigns
ALTER TABLE public.creator_campaigns RENAME TO campaigns;

-- PHASE 2: Rename columns in creators
ALTER TABLE public.creators RENAME COLUMN handle TO slug;
ALTER TABLE public.creators RENAME COLUMN public_layout TO layout_type;

-- PHASE 3: Update foreign key references in campaign_clicks
-- (campaign_clicks references creator_campaigns which is now campaigns — FK name stays the same, table renamed)

-- PHASE 4: Rename columns in creator_links for consistency
ALTER TABLE public.creator_links RENAME COLUMN featured TO is_featured;
ALTER TABLE public.creator_links RENAME COLUMN active TO is_active;

-- PHASE 5: Update RLS policies that reference old table name creator_campaigns
-- Drop and recreate policies on campaigns (formerly creator_campaigns)
DROP POLICY IF EXISTS "Admins+ can delete campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Agency members can select campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Campaigns are viewable by everyone" ON public.campaigns;
DROP POLICY IF EXISTS "Editors+ can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Editors+ can update campaigns" ON public.campaigns;

CREATE POLICY "Admins+ can delete campaigns" ON public.campaigns
FOR DELETE TO authenticated
USING (
  creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id())
  AND current_user_role() IN ('owner', 'admin')
);

CREATE POLICY "Agency members can select campaigns" ON public.campaigns
FOR SELECT TO authenticated
USING (
  creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id())
);

CREATE POLICY "Campaigns are viewable by everyone" ON public.campaigns
FOR SELECT TO public
USING (true);

CREATE POLICY "Editors+ can insert campaigns" ON public.campaigns
FOR INSERT TO authenticated
WITH CHECK (
  creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id())
  AND current_user_role() IN ('owner', 'admin', 'editor')
);

CREATE POLICY "Editors+ can update campaigns" ON public.campaigns
FOR UPDATE TO authenticated
USING (
  creator_id IN (SELECT id FROM creators WHERE agency_id = current_user_agency_id())
  AND current_user_role() IN ('owner', 'admin', 'editor')
);

-- PHASE 6: Update functions that reference old column names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.profiles (id, agency_id, full_name, email, role)
  VALUES (
    NEW.id, new_agency_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'email', ''),
    'owner'
  );

  INSERT INTO public.user_roles (user_id, agency_id, role)
  VALUES (NEW.id, new_agency_id, 'owner');

  INSERT INTO public.agency_settings (agency_id)
  VALUES (new_agency_id);

  RETURN NEW;
END;
$function$;

-- PHASE 7: Update analytics_events FK reference (was creator_campaigns, now campaigns)
-- The FK name stays but the referenced table was renamed, so this is automatic in Postgres.

-- PHASE 8: Create indexes on new names
CREATE INDEX IF NOT EXISTS idx_campaigns_creator_id ON public.campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_agency_id ON public.campaigns(agency_id);
CREATE INDEX IF NOT EXISTS idx_creators_slug ON public.creators(slug);
CREATE INDEX IF NOT EXISTS idx_creators_layout_type ON public.creators(layout_type);