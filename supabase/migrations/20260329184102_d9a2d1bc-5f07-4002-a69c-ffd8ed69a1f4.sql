DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  TO public
  WITH CHECK (
    event_type IS NOT NULL AND length(event_type) > 0
    AND (creator_id IS NULL OR EXISTS (
      SELECT 1 FROM public.creators c WHERE c.id = creator_id AND c.is_published = true
    ))
    AND (campaign_id IS NULL OR EXISTS (
      SELECT 1 FROM public.campaigns camp WHERE camp.id = campaign_id AND camp.is_active = true
    ))
    AND (link_id IS NULL OR EXISTS (
      SELECT 1 FROM public.creator_links cl
      JOIN public.creators cr ON cr.id = cl.creator_id
      WHERE cl.id = link_id AND cl.is_active = true AND cr.is_published = true
    ))
  );