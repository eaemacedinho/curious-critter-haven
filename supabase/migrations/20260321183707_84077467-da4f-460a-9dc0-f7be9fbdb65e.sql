-- PHASE 1: Remove automatic creator creation from handle_new_user trigger
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

  INSERT INTO public.profiles (id, agency_id, full_name, email, role)
  VALUES (
    NEW.id, new_agency_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'email', ''),
    'owner'
  );

  INSERT INTO public.user_roles (user_id, agency_id, role)
  VALUES (NEW.id, new_agency_id, 'owner');

  INSERT INTO public.agency_settings (agency_id)
  VALUES (new_agency_id);

  RETURN NEW;
END;
$function$;

-- PHASE 2: Simplify get_user_agency_id to profiles only
CREATE OR REPLACE FUNCTION public.get_user_agency_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT agency_id FROM public.profiles WHERE id = _user_id LIMIT 1
$function$;