
-- Add expires_at column to creator_campaigns
ALTER TABLE public.creator_campaigns
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT NULL;

-- Create campaign_clicks table for analytics
CREATE TABLE IF NOT EXISTS public.campaign_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.creator_campaigns(id) ON DELETE CASCADE,
  clicked_at timestamp with time zone NOT NULL DEFAULT now(),
  referrer text DEFAULT '',
  user_agent text DEFAULT ''
);

-- Enable RLS
ALTER TABLE public.campaign_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert clicks (public tracking)
CREATE POLICY "Anyone can insert clicks"
  ON public.campaign_clicks
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Creators can read their own campaign clicks
CREATE POLICY "Creators can read own campaign clicks"
  ON public.campaign_clicks
  FOR SELECT
  TO authenticated
  USING (
    campaign_id IN (
      SELECT cc.id FROM public.creator_campaigns cc
      JOIN public.creators c ON cc.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_campaign_clicks_campaign_id ON public.campaign_clicks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_clicks_clicked_at ON public.campaign_clicks(clicked_at);
