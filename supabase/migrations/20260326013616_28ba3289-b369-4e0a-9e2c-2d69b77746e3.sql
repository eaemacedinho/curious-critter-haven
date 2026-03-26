
-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL DEFAULT '',
  sender_email TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public contact form)
CREATE POLICY "Anyone can send contact messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Agency members can read their messages
CREATE POLICY "Agency members can read contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (agency_id = public.current_user_agency_id());

-- Agency members can update (mark as read)
CREATE POLICY "Agency members can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (agency_id = public.current_user_agency_id());

-- Add contact_enabled to creators
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS contact_enabled BOOLEAN NOT NULL DEFAULT true;
