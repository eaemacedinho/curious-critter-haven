-- ============================================================
-- FASE 1: PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role public.app_role NOT NULL DEFAULT 'owner',
  avatar_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Migrate existing user_roles data into profiles
INSERT INTO public.profiles (id, agency_id, role, created_at)
SELECT ur.user_id, ur.agency_id, ur.role, ur.created_at
FROM public.user_roles ur
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- FASE 2: ADD MISSING COLUMNS
-- ============================================================
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#A855F7';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS custom_domain text DEFAULT '';

ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS category text DEFAULT '';
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

ALTER TABLE public.creator_campaigns ADD COLUMN IF NOT EXISTS brand_name text DEFAULT '';
ALTER TABLE public.creator_campaigns ADD COLUMN IF NOT EXISTS cta_label text DEFAULT 'Saiba mais';
ALTER TABLE public.creator_campaigns ADD COLUMN IF NOT EXISTS priority_level integer DEFAULT 0;
ALTER TABLE public.creator_campaigns ADD COLUMN IF NOT EXISTS starts_at timestamptz DEFAULT NULL;
ALTER TABLE public.creator_campaigns ADD COLUMN IF NOT EXISTS spotlight_enabled boolean DEFAULT false;
ALTER TABLE public.creator_campaigns ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agencies(id) ON DELETE CASCADE DEFAULT NULL;

-- Backfill agency_id on creator_campaigns
UPDATE public.creator_campaigns cc
SET agency_id = c.agency_id
FROM public.creators c
WHERE cc.creator_id = c.id AND cc.agency_id IS NULL AND c.agency_id IS NOT NULL;

-- ============================================================
-- FASE 3: INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_creators_agency_id ON public.creators(agency_id);
CREATE INDEX IF NOT EXISTS idx_creators_handle ON public.creators(handle);
CREATE INDEX IF NOT EXISTS idx_creator_campaigns_agency_id ON public.creator_campaigns(agency_id);
CREATE INDEX IF NOT EXISTS idx_creator_campaigns_creator_id ON public.creator_campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_campaigns_live ON public.creator_campaigns(live);
CREATE INDEX IF NOT EXISTS idx_creator_links_creator_id ON public.creator_links(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_products_creator_id ON public.creator_products(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_social_links_creator_id ON public.creator_social_links(creator_id);
CREATE INDEX IF NOT EXISTS idx_profiles_agency_id ON public.profiles(agency_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_agency_id ON public.analytics_events(agency_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_creator_id ON public.analytics_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_clicks_campaign_id ON public.campaign_clicks(campaign_id);

-- ============================================================
-- FASE 4: HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_user_agency_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT agency_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_agency_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT agency_id FROM public.profiles WHERE id = _user_id LIMIT 1),
    (SELECT agency_id FROM public.user_roles WHERE user_id = _user_id LIMIT 1)
  )
$$;

-- ============================================================
-- FASE 5: RLS FOR PROFILES
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================
-- FASE 6: UPDATE CREATOR RLS TO AGENCY-SCOPED
-- ============================================================
DROP POLICY IF EXISTS "Users can delete own creators" ON public.creators;
DROP POLICY IF EXISTS "Users can insert own creator profile" ON public.creators;
DROP POLICY IF EXISTS "Users can update own creator profile" ON public.creators;

CREATE POLICY "Agency members can insert creators"
  ON public.creators FOR INSERT TO authenticated
  WITH CHECK (agency_id = current_user_agency_id());

CREATE POLICY "Agency members can update creators"
  ON public.creators FOR UPDATE TO authenticated
  USING (agency_id = current_user_agency_id());

CREATE POLICY "Agency members can delete creators"
  ON public.creators FOR DELETE TO authenticated
  USING (agency_id = current_user_agency_id());

-- ============================================================
-- FASE 7: UPDATE CAMPAIGNS RLS
-- ============================================================
DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.creator_campaigns;
DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.creator_campaigns;

CREATE POLICY "Agency members can manage campaigns"
  ON public.creator_campaigns FOR ALL TO authenticated
  USING (creator_id IN (
    SELECT id FROM public.creators WHERE agency_id = current_user_agency_id()
  ));

-- ============================================================
-- FASE 8: UPDATE LINKS/PRODUCTS/SOCIAL RLS
-- ============================================================
DROP POLICY IF EXISTS "Users can delete own links" ON public.creator_links;
DROP POLICY IF EXISTS "Users can manage own links" ON public.creator_links;
CREATE POLICY "Agency members can manage links"
  ON public.creator_links FOR ALL TO authenticated
  USING (creator_id IN (
    SELECT id FROM public.creators WHERE agency_id = current_user_agency_id()
  ));

DROP POLICY IF EXISTS "Users can delete own products" ON public.creator_products;
DROP POLICY IF EXISTS "Users can manage own products" ON public.creator_products;
CREATE POLICY "Agency members can manage products"
  ON public.creator_products FOR ALL TO authenticated
  USING (creator_id IN (
    SELECT id FROM public.creators WHERE agency_id = current_user_agency_id()
  ));

DROP POLICY IF EXISTS "Users can delete own social links" ON public.creator_social_links;
DROP POLICY IF EXISTS "Users can manage own social links" ON public.creator_social_links;
CREATE POLICY "Agency members can manage social links"
  ON public.creator_social_links FOR ALL TO authenticated
  USING (creator_id IN (
    SELECT id FROM public.creators WHERE agency_id = current_user_agency_id()
  ));

-- ============================================================
-- FASE 9: UPDATE CAMPAIGN_CLICKS AND AGENCY RLS
-- ============================================================
DROP POLICY IF EXISTS "Creators can read own campaign clicks" ON public.campaign_clicks;
CREATE POLICY "Agency members can read campaign clicks"
  ON public.campaign_clicks FOR SELECT TO authenticated
  USING (campaign_id IN (
    SELECT cc.id FROM public.creator_campaigns cc
    JOIN public.creators c ON cc.creator_id = c.id
    WHERE c.agency_id = current_user_agency_id()
  ));

DROP POLICY IF EXISTS "Agencies updatable by members" ON public.agencies;
DROP POLICY IF EXISTS "Agencies viewable by members" ON public.agencies;
CREATE POLICY "Agencies viewable by members v2"
  ON public.agencies FOR SELECT TO authenticated
  USING (id = current_user_agency_id());
CREATE POLICY "Agencies updatable by members v2"
  ON public.agencies FOR UPDATE TO authenticated
  USING (id = current_user_agency_id());

DROP POLICY IF EXISTS "Agency settings viewable by agency members" ON public.agency_settings;
DROP POLICY IF EXISTS "Agency settings updatable by agency members" ON public.agency_settings;
DROP POLICY IF EXISTS "Agency settings insertable by authenticated" ON public.agency_settings;
CREATE POLICY "Agency settings viewable v2"
  ON public.agency_settings FOR SELECT TO authenticated
  USING (agency_id = current_user_agency_id());
CREATE POLICY "Agency settings updatable v2"
  ON public.agency_settings FOR UPDATE TO authenticated
  USING (agency_id = current_user_agency_id());
CREATE POLICY "Agency settings insertable v2"
  ON public.agency_settings FOR INSERT TO authenticated
  WITH CHECK (agency_id = current_user_agency_id());

DROP POLICY IF EXISTS "Agency members can read own events" ON public.analytics_events;
CREATE POLICY "Agency members can read analytics v2"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (agency_id = current_user_agency_id());

-- ============================================================
-- FASE 10: UPDATE TRIGGER TO CREATE PROFILE
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  INSERT INTO public.creators (user_id, name, handle, agency_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    LOWER(REPLACE(REPLACE(COALESCE(NEW.raw_user_meta_data->>'email', NEW.id::text), '@', '-'), '.', '-')),
    new_agency_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FASE 11: STORAGE BUCKET FOR AGENCY ASSETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-assets', 'agency-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload agency assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'agency-assets');

CREATE POLICY "Anyone can view agency assets"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'agency-assets');

CREATE POLICY "Authenticated users can update agency assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'agency-assets');
