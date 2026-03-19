
-- Creators profile table
CREATE TABLE public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  handle TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '[]'::jsonb,
  brands JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators are viewable by everyone"
  ON public.creators FOR SELECT
  USING (true);

CREATE POLICY "Users can update own creator profile"
  ON public.creators FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own creator profile"
  ON public.creators FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Creator links table
CREATE TABLE public.creator_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  icon TEXT DEFAULT '🔗',
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Links are viewable by everyone"
  ON public.creator_links FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own links"
  ON public.creator_links FOR ALL
  TO authenticated
  USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

-- Creator social links
CREATE TABLE public.creator_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL DEFAULT '',
  label TEXT DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.creator_social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Social links are viewable by everyone"
  ON public.creator_social_links FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own social links"
  ON public.creator_social_links FOR ALL
  TO authenticated
  USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

-- Creator products
CREATE TABLE public.creator_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  price TEXT DEFAULT '',
  icon TEXT DEFAULT '📦',
  url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.creator_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.creator_products FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own products"
  ON public.creator_products FOR ALL
  TO authenticated
  USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

-- Creator campaigns
CREATE TABLE public.creator_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  url TEXT DEFAULT '',
  live BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.creator_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaigns are viewable by everyone"
  ON public.creator_campaigns FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own campaigns"
  ON public.creator_campaigns FOR ALL
  TO authenticated
  USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

-- Auto-create creator profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.creators (user_id, name, handle)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'email', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
