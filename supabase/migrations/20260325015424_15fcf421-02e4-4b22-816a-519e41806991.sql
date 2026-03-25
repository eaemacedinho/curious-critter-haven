CREATE TABLE public.creator_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Meu Template',
  template_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members can select templates"
  ON public.creator_templates FOR SELECT
  TO authenticated
  USING (agency_id = current_user_agency_id());

CREATE POLICY "Editors+ can insert templates"
  ON public.creator_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    agency_id = current_user_agency_id()
    AND current_user_role() = ANY(ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role])
  );

CREATE POLICY "Editors+ can update templates"
  ON public.creator_templates FOR UPDATE
  TO authenticated
  USING (
    agency_id = current_user_agency_id()
    AND current_user_role() = ANY(ARRAY['owner'::app_role, 'admin'::app_role, 'editor'::app_role])
  );

CREATE POLICY "Admins+ can delete templates"
  ON public.creator_templates FOR DELETE
  TO authenticated
  USING (
    agency_id = current_user_agency_id()
    AND current_user_role() = ANY(ARRAY['owner'::app_role, 'admin'::app_role])
  );