
-- 1. Create audit_logs table for critical event tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE CASCADE,
  target_table text,
  target_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins+ can read audit logs of their agency
CREATE POLICY "Agency admins can read audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (agency_id = current_user_agency_id() AND current_user_role() IN ('owner', 'admin'));

-- Only server-side (service role) can insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs FOR INSERT TO service_role
WITH CHECK (true);

-- Create index for fast lookups
CREATE INDEX idx_audit_logs_agency_id ON public.audit_logs(agency_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- 2. Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  external_id text NOT NULL,
  payload_hash text,
  processed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_type, external_id)
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
-- No public access - only service role via edge functions

-- 3. Add is_super_admin flag to profiles (replaces hardcoded email check)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

-- Set the existing super admin
UPDATE public.profiles SET is_super_admin = true WHERE email = 'gamacedo01@gmail.com';

-- 4. Create a security definer function to check super admin status
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE id = _user_id),
    false
  )
$$;

-- 5. Update coupons RLS to use is_super_admin instead of hardcoded email
DROP POLICY IF EXISTS "Super admin can manage coupons" ON public.coupons;

CREATE POLICY "Super admin can manage coupons"
ON public.coupons FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- 6. Add storage RLS policies for tenant isolation
-- avatars bucket
CREATE POLICY "Users can upload avatars to own agency path"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = current_user_agency_id()::text
);

CREATE POLICY "Users can update avatars in own agency path"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = current_user_agency_id()::text
);

CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

-- covers bucket
CREATE POLICY "Users can upload covers to own agency path"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'covers' AND
  (storage.foldername(name))[1] = current_user_agency_id()::text
);

CREATE POLICY "Users can update covers in own agency path"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'covers' AND
  (storage.foldername(name))[1] = current_user_agency_id()::text
);

CREATE POLICY "Anyone can read covers"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'covers');

-- content bucket
CREATE POLICY "Users can upload content to own agency path"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'content' AND
  (storage.foldername(name))[1] = current_user_agency_id()::text
);

CREATE POLICY "Users can update content in own agency path"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'content' AND
  (storage.foldername(name))[1] = current_user_agency_id()::text
);

CREATE POLICY "Anyone can read content"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'content');

-- agency-assets bucket
CREATE POLICY "Users can upload agency-assets to own agency path"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'agency-assets' AND
  (storage.foldername(name))[1] = current_user_agency_id()::text
);

CREATE POLICY "Users can update agency-assets in own agency path"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'agency-assets' AND
  (storage.foldername(name))[1] = current_user_agency_id()::text
);

CREATE POLICY "Anyone can read agency-assets"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'agency-assets');

-- videos bucket
CREATE POLICY "Users can upload videos to own agency path"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = current_user_agency_id()::text
);

CREATE POLICY "Users can update videos in own agency path"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = current_user_agency_id()::text
);

CREATE POLICY "Anyone can read videos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'videos');

-- 7. Atomic coupon consumption function
CREATE OR REPLACE FUNCTION public.atomic_consume_coupon(p_coupon_code text, p_plan text)
RETURNS TABLE(coupon_id uuid, discount_percent integer, code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT c.* INTO v_coupon
  FROM public.coupons c
  WHERE c.code = UPPER(TRIM(p_coupon_code))
    AND c.is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cupom inválido ou inativo';
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RAISE EXCEPTION 'Cupom expirado';
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RAISE EXCEPTION 'Cupom esgotado';
  END IF;

  IF NOT (p_plan = ANY(v_coupon.valid_plans)) THEN
    RAISE EXCEPTION 'Cupom não válido para este plano';
  END IF;

  -- Atomic increment
  UPDATE public.coupons
  SET current_uses = current_uses + 1, updated_at = now()
  WHERE id = v_coupon.id;

  RETURN QUERY SELECT v_coupon.id, v_coupon.discount_percent, v_coupon.code;
END;
$$;

-- 8. Function to rollback coupon usage
CREATE OR REPLACE FUNCTION public.rollback_coupon_usage(p_coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET current_uses = GREATEST(0, current_uses - 1), updated_at = now()
  WHERE id = p_coupon_id;
END;
$$;
