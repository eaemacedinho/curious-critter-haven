-- Allow agency admins/owners to view all profiles in their agency
CREATE POLICY "Agency admins can view agency members"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  agency_id = current_user_agency_id()
  AND current_user_role() IN ('owner', 'admin')
);

-- Allow owners to update roles of members in their agency (not their own)
CREATE POLICY "Owners can update agency members"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  agency_id = current_user_agency_id()
  AND current_user_role() = 'owner'
  AND id != auth.uid()
)
WITH CHECK (
  agency_id = current_user_agency_id()
  AND current_user_role() = 'owner'
  AND id != auth.uid()
);

-- Allow owners to remove members from their agency
CREATE POLICY "Owners can delete agency members"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  agency_id = current_user_agency_id()
  AND current_user_role() = 'owner'
  AND id != auth.uid()
);