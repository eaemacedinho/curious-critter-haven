
CREATE TABLE public.confirmation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_confirmation_codes_email_created ON public.confirmation_codes(email, created_at DESC);

ALTER TABLE public.confirmation_codes ENABLE ROW LEVEL SECURITY;
