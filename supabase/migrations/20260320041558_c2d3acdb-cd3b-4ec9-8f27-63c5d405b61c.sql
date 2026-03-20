-- Drop the unique constraint on user_id to allow multiple creators per user (agency model)
ALTER TABLE public.creators DROP CONSTRAINT IF EXISTS creators_user_id_key;

-- Also update the handle_new_user function to handle edge cases
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_agency_id uuid;
BEGIN
  INSERT INTO public.agencies (owner_id, name, slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Minha Agência'),
    LOWER(REPLACE(REPLACE(COALESCE(NEW.raw_user_meta_data->>'email', NEW.id::text), '@', '-'), '.', '-'))
  )
  RETURNING id INTO new_agency_id;

  INSERT INTO public.creators (user_id, name, handle, agency_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    LOWER(REPLACE(REPLACE(COALESCE(NEW.raw_user_meta_data->>'email', NEW.id::text), '@', '-'), '.', '-')),
    new_agency_id
  );

  RETURN NEW;
END;
$function$;