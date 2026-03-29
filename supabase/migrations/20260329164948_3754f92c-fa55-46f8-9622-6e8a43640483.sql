
-- 1. Restrict get_user_agency_id: revoke from anon/authenticated/public, keep only service_role
REVOKE EXECUTE ON FUNCTION public.get_user_agency_id(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_agency_id(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_agency_id(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_user_agency_id(uuid) TO service_role;

-- 2. Ensure unique active membership per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_agency_memberships_single_active
  ON public.agency_memberships (user_id)
  WHERE (status = 'active');
