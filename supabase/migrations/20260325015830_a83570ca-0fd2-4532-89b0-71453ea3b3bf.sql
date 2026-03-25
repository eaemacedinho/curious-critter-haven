-- Add is_default flag and make creator_id nullable for agency-level templates
ALTER TABLE public.creator_templates 
  ADD COLUMN is_default boolean NOT NULL DEFAULT false,
  ALTER COLUMN creator_id DROP NOT NULL;

-- Allow agency-level templates (creator_id = NULL, is_default = true)
-- Only one default per agency
CREATE UNIQUE INDEX idx_one_default_per_agency 
  ON public.creator_templates (agency_id) 
  WHERE is_default = true;

-- Update max_creators for pro plan to 10
UPDATE public.plan_limits SET max_creators = 10 WHERE plan = 'pro';