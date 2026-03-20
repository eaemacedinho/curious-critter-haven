ALTER TABLE public.creators 
  ADD COLUMN image_shape_products text NOT NULL DEFAULT 'rounded',
  ADD COLUMN image_shape_campaigns text NOT NULL DEFAULT 'rounded',
  ADD COLUMN image_shape_links text NOT NULL DEFAULT 'rounded';

UPDATE public.creators 
SET image_shape_products = image_shape,
    image_shape_campaigns = image_shape,
    image_shape_links = image_shape
WHERE image_shape != 'rounded';