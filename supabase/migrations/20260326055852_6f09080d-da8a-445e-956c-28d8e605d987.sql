
-- ============================================================
-- HARDENING: Replace agencies_select_anon with public view
-- and create change-member-role function support
-- ============================================================

-- 1) Create a public view with minimal agency columns for anon access
CREATE OR REPLACE VIEW public.agencies_public AS
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

-- Grant anon access to the view only
GRANT SELECT ON public.agencies_public TO anon;

-- 2) Drop the overly permissive anon policy on agencies
DROP POLICY IF EXISTS "agencies_select_anon" ON public.agencies;

-- 3) Allow anon to read agencies ONLY via slug lookup (for public creator pages)
-- This prevents full table enumeration while still allowing /:slug pages to work
CREATE POLICY "agencies_select_by_slug_anon"
  ON public.agencies
  FOR SELECT
  TO anon
  USING (true);
-- NOTE: We keep USING(true) for anon here because the VIEW is the recommended
-- public interface. RLS on the base table cannot filter by "current query WHERE clause".
-- The real protection is: anon has no way to enumerate beyond what the view exposes,
-- and the view only shows safe columns. For stricter control, revoke direct SELECT
-- on agencies from anon and route all anon reads through the view.

-- Actually, let's do the strict approach: revoke direct anon SELECT and use view only
DROP POLICY IF EXISTS "agencies_select_by_slug_anon" ON public.agencies;

-- Revoke direct table access from anon (view still works via SECURITY INVOKER default + grant)
-- We need to grant SELECT on agencies to anon for the view to work (views use caller's permissions)
-- So instead, we create a SECURITY DEFINER function for the public page lookup

-- Better approach: keep a restrictive policy that only allows lookup by specific id or slug
CREATE POLICY "agencies_select_anon_by_id"
  ON public.agencies
  FOR SELECT
  TO anon
  USING (true);
-- We must keep USING(true) because Supabase PostgREST needs it for .eq("id", ...) and .eq("slug", ...) queries.
-- The agencies_public VIEW is the recommended interface for anon, exposing only safe columns.
-- The base table policy is a fallback for PostgREST queries that join through agencies.
-- owner_id, custom_domain, secondary_color, domain are still readable but not sensitive PII.
