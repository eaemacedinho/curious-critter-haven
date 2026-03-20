
-- Create a general-purpose public bucket for content images (campaigns, products, brands)
INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to content bucket
CREATE POLICY "Authenticated users can upload content"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'content');

-- Allow authenticated users to update their own content
CREATE POLICY "Authenticated users can update own content"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'content' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own content
CREATE POLICY "Authenticated users can delete own content"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'content' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to content bucket
CREATE POLICY "Public can read content"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'content');

-- Add image_url column to creator_products
ALTER TABLE public.creator_products ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';
