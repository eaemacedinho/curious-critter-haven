
-- 1) Fix non-deterministic current_user_agency_id() - add ORDER BY created_at ASC
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
  ORDER BY created_at ASC
  LIMIT 1
$$;

-- 2) Fix non-deterministic current_user_role() - add ORDER BY created_at ASC
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
  ORDER BY created_at ASC
  LIMIT 1
$$;

-- 3) Fix non-deterministic get_user_agency_id() - add ORDER BY created_at ASC
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
  ORDER BY created_at ASC
  LIMIT 1
$$;

-- 4) Replace overly permissive anon policy on agencies
-- Drop the current USING(true) policy
DROP POLICY IF EXISTS "agencies_select_anon_by_id" ON public.agencies;
DROP POLICY IF EXISTS "agencies_select_anon" ON public.agencies;

-- Anon should ONLY read agencies via the agencies_public view (already created).
-- No direct anon SELECT policy on the base agencies table.
-- The view agencies_public already has GRANT SELECT to anon and exposes only safe columns.
-- We need to ensure the view works: since it's a simple view (SECURITY INVOKER by default in pg15+),
-- anon needs SELECT on the base table. So we create a policy that allows SELECT but only
-- the columns exposed by the view are what anon can practically access via PostgREST.
-- However, PostgREST CAN query the base table directly. So we restrict to slug-based lookup only.

-- Since RLS cannot filter by "which columns are in the query", we take a different approach:
-- REVOKE direct SELECT on agencies from anon, and make the view SECURITY DEFINER
-- so it reads with the view owner's permissions.

-- First, drop and recreate the view as SECURITY DEFINER
DROP VIEW IF EXISTS public.agencies_public;

CREATE VIEW public.agencies_public
WITH (security_invoker = false)
AS
SELECT
  id,
  name,
  slug,
  logo_url,
  primary_color,
  accent_color,
  footer_text,
  footer_visible,
  footer_link
FROM public.agencies;

-- Grant anon SELECT on the view only
GRANT SELECT ON public.agencies_public TO anon;
GRANT SELECT ON public.agencies_public TO authenticated;

-- Revoke direct anon access to agencies base table
-- (authenticated users still have RLS policies for their own agency)
REVOKE SELECT ON public.agencies FROM anon;
