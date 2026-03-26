
-- =====================================================
-- HARDENING MIGRATION: Membership-based auth + RLS
-- =====================================================

-- 1) Replace current_user_agency_id() to use agency_memberships
CREATE OR REPLACE FUNCTION public.current_user_agency_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT agency_id
  FROM public.agency_memberships
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1
$$;

-- 2) Replace current_user_role() to use agency_memberships
CREATE OR REPLACE FUNCTION public.current_user_role()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.agency_memberships
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1
$$;

-- 3) Replace get_user_agency_id() to use agency_memberships
CREATE OR REPLACE FUNCTION public.get_user_agency_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT agency_id
  FROM public.agency_memberships
  WHERE user_id = _user_id
    AND status = 'active'
  LIMIT 1
$$;

-- 4) Harden is_super_admin() - SECURITY DEFINER prevents client manipulation
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE id = _user_id),
    false
  )
$$;

-- =====================================================
-- PROFILES RLS - prevent privilege escalation
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Agency admins can view agency members" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own non-sensitive profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Owners can update agency member roles" ON public.profiles;
DROP POLICY IF EXISTS "Owners can delete agency members" ON public.profiles;

-- SELECT: own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- SELECT: admins/owners can see agency members
CREATE POLICY "profiles_select_agency_members" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    agency_id = current_user_agency_id()
    AND current_user_role() IN ('owner', 'admin')
  );

-- INSERT: only own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- UPDATE: self - CANNOT change role, is_super_admin, or agency_id
CREATE POLICY "profiles_update_own_safe" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND is_super_admin = (SELECT p.is_super_admin FROM public.profiles p WHERE p.id = auth.uid())
    AND agency_id IS NOT DISTINCT FROM (SELECT p.agency_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- UPDATE: owner can change OTHER members' roles (not self, not to owner, not is_super_admin)
CREATE POLICY "profiles_update_member_role" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    agency_id = current_user_agency_id()
    AND current_user_role() = 'owner'
    AND id <> auth.uid()
  )
  WITH CHECK (
    agency_id = current_user_agency_id()
    AND id <> auth.uid()
    AND is_super_admin = false
    AND role <> 'owner'
  );

-- DELETE: owner can remove OTHER members
CREATE POLICY "profiles_delete_member" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    agency_id = current_user_agency_id()
    AND current_user_role() = 'owner'
    AND id <> auth.uid()
  );

-- =====================================================
-- AGENCIES RLS
-- =====================================================
DROP POLICY IF EXISTS "Agencies viewable by members v2" ON public.agencies;
DROP POLICY IF EXISTS "Agencies viewable by everyone for public pages" ON public.agencies;
DROP POLICY IF EXISTS "Agencies insertable by authenticated" ON public.agencies;
DROP POLICY IF EXISTS "Admins+ can update agency" ON public.agencies;

CREATE POLICY "agencies_select_public" ON public.agencies
  FOR SELECT TO public
  USING (true);

CREATE POLICY "agencies_insert_own" ON public.agencies
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "agencies_update_members" ON public.agencies
  FOR UPDATE TO authenticated
  USING (
    id = current_user_agency_id()
    AND current_user_role() IN ('owner', 'admin')
  );

-- =====================================================
-- AGENCY_SETTINGS RLS
-- =====================================================
DROP POLICY IF EXISTS "Agency settings viewable v2" ON public.agency_settings;
DROP POLICY IF EXISTS "Agency settings insertable v2" ON public.agency_settings;
DROP POLICY IF EXISTS "Admins+ can update agency settings" ON public.agency_settings;

CREATE POLICY "agency_settings_select" ON public.agency_settings
  FOR SELECT TO authenticated
  USING (agency_id = current_user_agency_id());

CREATE POLICY "agency_settings_insert" ON public.agency_settings
  FOR INSERT TO authenticated
  WITH CHECK (agency_id = current_user_agency_id());

CREATE POLICY "agency_settings_update" ON public.agency_settings
  FOR UPDATE TO authenticated
  USING (
    agency_id = current_user_agency_id()
    AND current_user_role() IN ('owner', 'admin')
  );

-- =====================================================
-- COUPONS RLS - split into separate command policies
-- =====================================================
DROP POLICY IF EXISTS "Super admin can manage coupons" ON public.coupons;

CREATE POLICY "coupons_select_super_admin" ON public.coupons
  FOR SELECT TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "coupons_insert_service" ON public.coupons
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "coupons_update_service" ON public.coupons
  FOR UPDATE TO service_role
  USING (true);

CREATE POLICY "coupons_delete_service" ON public.coupons
  FOR DELETE TO service_role
  USING (true);

-- =====================================================
-- CONFIRMATION_CODES - enable RLS
-- =====================================================
ALTER TABLE public.confirmation_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "confirmation_codes_service_only" ON public.confirmation_codes;
CREATE POLICY "confirmation_codes_service_only" ON public.confirmation_codes
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
