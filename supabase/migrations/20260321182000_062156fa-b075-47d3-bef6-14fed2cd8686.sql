-- =============================================
-- PHASE 1: User Roles
-- =============================================
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, agency_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's agency_id
CREATE OR REPLACE FUNCTION public.get_user_agency_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT agency_id
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS: users can see their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- PHASE 2: Agency Settings
-- =============================================
CREATE TABLE public.agency_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL UNIQUE REFERENCES public.agencies(id) ON DELETE CASCADE,
  platform_display_name text NOT NULL DEFAULT '',
  favicon_url text DEFAULT '',
  default_layout text NOT NULL DEFAULT 'layout1',
  onboarding_completed boolean NOT NULL DEFAULT false,
  theme_mode text NOT NULL DEFAULT 'dark',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency settings viewable by agency members"
ON public.agency_settings FOR SELECT
TO authenticated
USING (agency_id = public.get_user_agency_id(auth.uid()));

CREATE POLICY "Agency settings updatable by agency members"
ON public.agency_settings FOR UPDATE
TO authenticated
USING (agency_id = public.get_user_agency_id(auth.uid()));

CREATE POLICY "Agency settings insertable by authenticated"
ON public.agency_settings FOR INSERT
TO authenticated
WITH CHECK (agency_id = public.get_user_agency_id(auth.uid()));

-- =============================================
-- PHASE 3: Analytics Events
-- =============================================
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  creator_id uuid REFERENCES public.creators(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES public.creator_campaigns(id) ON DELETE SET NULL,
  link_id uuid REFERENCES public.creator_links(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (public pages)
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events FOR INSERT
TO public
WITH CHECK (true);

-- Agency members can read their events
CREATE POLICY "Agency members can read own events"
ON public.analytics_events FOR SELECT
TO authenticated
USING (agency_id = public.get_user_agency_id(auth.uid()));

-- Index for fast queries
CREATE INDEX idx_analytics_events_agency ON public.analytics_events(agency_id, created_at DESC);
CREATE INDEX idx_analytics_events_creator ON public.analytics_events(creator_id, created_at DESC);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type, created_at DESC);

-- =============================================
-- PHASE 4: Backfill user_roles for existing users
-- =============================================
INSERT INTO public.user_roles (user_id, agency_id, role)
SELECT owner_id, id, 'owner'
FROM public.agencies
ON CONFLICT DO NOTHING;

-- Backfill agency_settings for existing agencies
INSERT INTO public.agency_settings (agency_id)
SELECT id FROM public.agencies
ON CONFLICT DO NOTHING;

-- =============================================
-- PHASE 5: Update handle_new_user trigger
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_agency_id uuid;
BEGIN
  -- Create agency
  INSERT INTO public.agencies (owner_id, name, slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Minha Agência'),
    LOWER(REPLACE(REPLACE(COALESCE(NEW.raw_user_meta_data->>'email', NEW.id::text), '@', '-'), '.', '-'))
  )
  RETURNING id INTO new_agency_id;

  -- Create user role as owner
  INSERT INTO public.user_roles (user_id, agency_id, role)
  VALUES (NEW.id, new_agency_id, 'owner');

  -- Create agency settings
  INSERT INTO public.agency_settings (agency_id)
  VALUES (new_agency_id);

  -- Create initial creator for the agency
  INSERT INTO public.creators (user_id, name, handle, agency_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    LOWER(REPLACE(REPLACE(COALESCE(NEW.raw_user_meta_data->>'email', NEW.id::text), '@', '-'), '.', '-')),
    new_agency_id
  );

  RETURN NEW;
END;
$function$;

-- =============================================
-- PHASE 6: Update RLS policies for multi-tenant
-- =============================================

-- Update agencies policies to use user_roles
DROP POLICY IF EXISTS "Agencies viewable by owner" ON public.agencies;
CREATE POLICY "Agencies viewable by members"
ON public.agencies FOR SELECT
TO authenticated
USING (id = public.get_user_agency_id(auth.uid()));

DROP POLICY IF EXISTS "Agencies updatable by owner" ON public.agencies;
CREATE POLICY "Agencies updatable by members"
ON public.agencies FOR UPDATE
TO authenticated
USING (id = public.get_user_agency_id(auth.uid()));

DROP POLICY IF EXISTS "Agencies insertable" ON public.agencies;
CREATE POLICY "Agencies insertable by authenticated"
ON public.agencies FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());