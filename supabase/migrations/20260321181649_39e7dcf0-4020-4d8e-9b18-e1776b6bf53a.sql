-- Allow public read of agency branding for public creator pages
CREATE POLICY "Agencies viewable by everyone for public pages"
ON public.agencies
FOR SELECT
TO public
USING (true);