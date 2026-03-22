
-- Tighten the insert policy: only allow inserting with valid referrer
DROP POLICY IF EXISTS "Anyone can insert referrals" ON public.referrals;
CREATE POLICY "Authenticated can insert referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (referred_user_id = auth.uid());
