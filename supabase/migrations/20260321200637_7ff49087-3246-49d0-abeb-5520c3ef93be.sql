-- Drop the dangerous CASCADE FK on user_id
ALTER TABLE public.creators DROP CONSTRAINT IF EXISTS creators_user_id_fkey;

-- Make user_id nullable (audit field, not structural)
ALTER TABLE public.creators ALTER COLUMN user_id DROP NOT NULL;

-- Add documentation comment
COMMENT ON COLUMN public.creators.user_id IS 'Audit only: user who created this creator. Not a structural relationship.';

-- Drop any unique index on user_id if exists
DROP INDEX IF EXISTS creators_user_id_key;
DROP INDEX IF EXISTS creators_user_id_idx;