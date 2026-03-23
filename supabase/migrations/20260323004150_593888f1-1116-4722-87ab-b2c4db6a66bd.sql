-- Plan type enum
CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'scale');

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  plan plan_type NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  payment_provider text DEFAULT 'pagarme',
  payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agency_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members can view subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (agency_id = current_user_agency_id());

CREATE POLICY "Admins+ can update subscription"
  ON public.subscriptions FOR UPDATE TO authenticated
  USING (agency_id = current_user_agency_id() AND current_user_role() = ANY(ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins+ can insert subscription"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (agency_id = current_user_agency_id());

-- Plan limits table
CREATE TABLE public.plan_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan plan_type NOT NULL UNIQUE,
  max_creators int NOT NULL DEFAULT 1,
  max_links int NOT NULL DEFAULT 5,
  max_products int NOT NULL DEFAULT 3,
  max_campaigns int NOT NULL DEFAULT 0,
  max_hero_reels int NOT NULL DEFAULT 0,
  allow_analytics boolean NOT NULL DEFAULT false,
  allow_custom_colors boolean NOT NULL DEFAULT false,
  allow_layout_immersive boolean NOT NULL DEFAULT false,
  allow_page_effects boolean NOT NULL DEFAULT false,
  allow_verified_badge boolean NOT NULL DEFAULT false,
  allow_remove_branding boolean NOT NULL DEFAULT false,
  allow_custom_domain boolean NOT NULL DEFAULT false,
  allow_team_members boolean NOT NULL DEFAULT false
);

ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plan limits are viewable by everyone"
  ON public.plan_limits FOR SELECT TO public
  USING (true);

INSERT INTO public.plan_limits (plan, max_creators, max_links, max_products, max_campaigns, max_hero_reels, allow_analytics, allow_custom_colors, allow_layout_immersive, allow_page_effects, allow_verified_badge, allow_remove_branding, allow_custom_domain, allow_team_members)
VALUES
  ('free', 1, 5, 3, 0, 0, false, false, false, false, false, false, false, false),
  ('pro', 999, 999, 999, 999, 999, true, true, true, true, true, true, false, false),
  ('scale', 999, 999, 999, 999, 999, true, true, true, true, true, true, true, true);

-- Auto-create free subscription for new agencies
CREATE OR REPLACE FUNCTION public.auto_create_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.subscriptions (agency_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (agency_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_agency_created_subscription
  AFTER INSERT ON public.agencies
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_subscription();

-- Backfill existing agencies
INSERT INTO public.subscriptions (agency_id, plan, status)
SELECT id, 'free', 'active' FROM public.agencies
WHERE id NOT IN (SELECT agency_id FROM public.subscriptions)
ON CONFLICT (agency_id) DO NOTHING;