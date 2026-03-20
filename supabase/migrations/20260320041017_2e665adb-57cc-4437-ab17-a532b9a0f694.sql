CREATE POLICY "Users can delete own creators"
ON public.creators
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);