
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent integer NOT NULL CHECK (discount_percent >= 1 AND discount_percent <= 100),
  valid_plans text[] NOT NULL DEFAULT ARRAY['pro', 'scale'],
  is_active boolean NOT NULL DEFAULT true,
  max_uses integer DEFAULT NULL,
  current_uses integer NOT NULL DEFAULT 0,
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Only the super admin (gamacedo01@gmail.com) can manage coupons
CREATE POLICY "Super admin can manage coupons"
ON public.coupons
FOR ALL
TO authenticated
USING (
  (SELECT email FROM public.profiles WHERE id = auth.uid()) = 'gamacedo01@gmail.com'
)
WITH CHECK (
  (SELECT email FROM public.profiles WHERE id = auth.uid()) = 'gamacedo01@gmail.com'
);

-- Anyone authenticated can read active coupons (for validation at checkout)
CREATE POLICY "Authenticated can read active coupons"
ON public.coupons
FOR SELECT
TO authenticated
USING (is_active = true);
