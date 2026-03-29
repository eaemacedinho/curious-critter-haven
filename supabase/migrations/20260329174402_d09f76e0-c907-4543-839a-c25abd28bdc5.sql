-- ============================================================
-- 1. Fix: analytics_events INSERT - validate creator/campaign exist
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  TO public
  WITH CHECK (
    -- event_type must be non-empty
    event_type IS NOT NULL AND length(event_type) > 0
    -- if creator_id provided, must reference a published creator
    AND (creator_id IS NULL OR EXISTS (
      SELECT 1 FROM public.creators c WHERE c.id = creator_id AND c.is_published = true
    ))
    -- if campaign_id provided, must reference an active campaign
    AND (campaign_id IS NULL OR EXISTS (
      SELECT 1 FROM public.campaigns camp WHERE camp.id = campaign_id AND camp.is_active = true
    ))
    -- if link_id provided, must reference an existing link
    AND (link_id IS NULL OR EXISTS (
      SELECT 1 FROM public.creator_links cl WHERE cl.id = link_id
    ))
  );

-- ============================================================
-- 2. Fix: referrals INSERT - block client-side INSERT entirely
--    (referrals are created via link-referral edge function using service_role)
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert referrals" ON public.referrals;

-- No replacement INSERT policy needed - edge function uses service_role which bypasses RLS

-- ============================================================
-- 3. Fix: creators SELECT - restrict public to published only
-- ============================================================
DROP POLICY IF EXISTS "Creators are viewable by everyone" ON public.creators;

-- Public/anon can only see published creators
CREATE POLICY "Published creators are viewable by everyone"
  ON public.creators
  FOR SELECT
  TO public
  USING (is_published = true);

-- Agency members can see all their creators (including unpublished)
CREATE POLICY "Agency members can view own creators"
  ON public.creators
  FOR SELECT
  TO authenticated
  USING (agency_id = current_user_agency_id());

-- ============================================================
-- 4. Fix: conflicting storage DELETE policies (remove old uid-based ones)
-- ============================================================
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own content" ON storage.objects;

-- ============================================================
-- 5. Fix: agencies_public view - change from SECURITY DEFINER to INVOKER
-- ============================================================
DROP VIEW IF EXISTS public.agencies_public;
CREATE VIEW public.agencies_public
  WITH (security_invoker = true)
AS
  SELECT id, name, slug, logo_url, primary_color, accent_color,
         footer_text, footer_visible, footer_link
  FROM agencies;

-- Grant public read access to the view
GRANT SELECT ON public.agencies_public TO anon, authenticated;

-- ============================================================
-- 6. Fix: campaign_clicks INSERT - validate campaign exists
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.campaign_clicks;

CREATE POLICY "Anyone can insert clicks"
  ON public.campaign_clicks
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.is_active = true
    )
  );