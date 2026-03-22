-- Add is_active to creator_products (visibility toggle)
ALTER TABLE public.creator_products 
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add is_active to campaigns (visibility toggle, separate from "live" which controls spotlight)
ALTER TABLE public.campaigns 
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;