
-- ============================================================
-- 1. CREATE agency_memberships TABLE (multi-tenant source of truth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agency_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'viewer',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, agency_id)
);

ALTER TABLE public.agency_memberships ENABLE ROW LEVEL SECURITY;

-- Memberships policies
CREATE POLICY "Users can view own memberships"
  ON public.agency_memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Agency owners can view all memberships"
  ON public.agency_memberships FOR SELECT TO authenticated
  USING (
    agency_id = current_user_agency_id()
    AND current_user_role() IN ('owner', 'admin')
  );

CREATE POLICY "Only service_role can insert memberships"
  ON public.agency_memberships FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Only service_role can update memberships"
  ON public.agency_memberships FOR UPDATE TO service_role
  USING (true);

CREATE POLICY "Only service_role can delete memberships"
  ON public.agency_memberships FOR DELETE TO service_role
  USING (true);

-- Helper functions
CREATE OR REPLACE FUNCTION public.user_has_membership(_user_id uuid, _agency_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agency_memberships
    WHERE user_id = _user_id AND agency_id = _agency_id AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.user_membership_role(_user_id uuid, _agency_id uuid)
RETURNS public.app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT role FROM public.agency_memberships
  WHERE user_id = _user_id AND agency_id = _agency_id AND status = 'active'
  LIMIT 1
$$;

-- ============================================================
-- 2. BACKFILL agency_memberships from existing profiles
-- ============================================================
INSERT INTO public.agency_memberships (user_id, agency_id, role, status)
SELECT p.id, p.agency_id, p.role, 'active'
FROM public.profiles p
WHERE p.agency_id IS NOT NULL
ON CONFLICT (user_id, agency_id) DO NOTHING;

INSERT INTO public.agency_memberships (user_id, agency_id, role, status)
SELECT ur.user_id, ur.agency_id, ur.role, 'active'
FROM public.user_roles ur
ON CONFLICT (user_id, agency_id) DO NOTHING;

-- ============================================================
-- 3. HARDEN profiles RLS - prevent privilege escalation
-- ============================================================
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can update agency members" ON public.profiles;

CREATE POLICY "Users can update own non-sensitive profile fields"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p2.role FROM public.profiles p2 WHERE p2.id = auth.uid())
    AND is_super_admin = (SELECT p3.is_super_admin FROM public.profiles p3 WHERE p3.id = auth.uid())
  );

CREATE POLICY "Owners can update agency member roles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    agency_id = current_user_agency_id()
    AND current_user_role() = 'owner'
    AND id <> auth.uid()
  )
  WITH CHECK (
    agency_id = current_user_agency_id()
    AND current_user_role() = 'owner'
    AND id <> auth.uid()
    AND is_super_admin = false
    AND role <> 'owner'
  );

-- ============================================================
-- 4. HARDEN subscriptions RLS - only server can write
-- ============================================================
DROP POLICY IF EXISTS "Admins+ can insert subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins+ can update subscription" ON public.subscriptions;

CREATE POLICY "Only server can insert subscriptions"
  ON public.subscriptions FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Only server can update subscriptions"
  ON public.subscriptions FOR UPDATE TO service_role
  USING (true);

-- ============================================================
-- 5. HARDEN coupons RLS - remove general read
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can read active coupons" ON public.coupons;

-- ============================================================
-- 6. HARDEN webhook_events RLS
-- ============================================================
CREATE POLICY "Only server can manage webhook_events"
  ON public.webhook_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 7. HARDEN contact_messages INSERT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can send contact messages" ON public.contact_messages;

CREATE POLICY "Anyone can send contact messages with valid creator"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.creators c
      WHERE c.id = creator_id AND c.agency_id = contact_messages.agency_id
    )
  );

-- ============================================================
-- 8. Update handle_new_user to also create membership
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_agency_id uuid;
  v_invited_agency_id uuid;
  v_invited_role public.app_role;
BEGIN
  v_invited_agency_id := (NEW.raw_user_meta_data->>'invited_agency_id')::uuid;
  v_invited_role := COALESCE(
    (NEW.raw_user_meta_data->>'invited_role')::public.app_role,
    'viewer'
  );

  IF v_invited_agency_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, agency_id, full_name, email, role)
    VALUES (
      NEW.id, v_invited_agency_id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'email', ''),
      v_invited_role
    ) ON CONFLICT (id) DO UPDATE SET
      agency_id = v_invited_agency_id,
      role = v_invited_role;

    INSERT INTO public.agency_memberships (user_id, agency_id, role, status)
    VALUES (NEW.id, v_invited_agency_id, v_invited_role, 'active')
    ON CONFLICT (user_id, agency_id) DO UPDATE SET role = v_invited_role, status = 'active';

    INSERT INTO public.user_roles (user_id, agency_id, role)
    VALUES (NEW.id, v_invited_agency_id, v_invited_role)
    ON CONFLICT DO NOTHING;

    RETURN NEW;
  END IF;

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

  INSERT INTO public.agency_memberships (user_id, agency_id, role, status)
  VALUES (NEW.id, new_agency_id, 'owner', 'active');

  INSERT INTO public.agency_settings (agency_id)
  VALUES (new_agency_id);

  RETURN NEW;
END;
$$;
