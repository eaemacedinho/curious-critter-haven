
-- Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Generate referral codes for existing users
UPDATE public.profiles 
SET referral_code = LOWER(SUBSTR(MD5(id::text || now()::text), 1, 8))
WHERE referral_code IS NULL;

-- Make referral_code NOT NULL with default
ALTER TABLE public.profiles ALTER COLUMN referral_code SET DEFAULT LOWER(SUBSTR(MD5(gen_random_uuid()::text), 1, 8));

-- Create referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  converted_at timestamptz,
  UNIQUE(referred_user_id)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (referrer_user_id = auth.uid());

-- Anyone can insert referrals (for tracking)
CREATE POLICY "Anyone can insert referrals"
  ON public.referrals FOR INSERT TO public
  WITH CHECK (true);

-- System can update referrals
CREATE POLICY "Users can update own referrals"
  ON public.referrals FOR UPDATE TO authenticated
  USING (referrer_user_id = auth.uid());

-- Function to auto-generate referral code on new profile
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := LOWER(SUBSTR(MD5(NEW.id::text || now()::text || random()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code
CREATE TRIGGER ensure_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();
