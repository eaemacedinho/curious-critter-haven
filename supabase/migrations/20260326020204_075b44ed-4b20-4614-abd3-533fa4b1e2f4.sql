CREATE POLICY "Agency members can delete contact messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (agency_id = current_user_agency_id());