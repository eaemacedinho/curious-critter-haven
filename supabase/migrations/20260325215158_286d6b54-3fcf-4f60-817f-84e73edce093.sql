
-- Delete duplicate creator's links
DELETE FROM public.creator_links WHERE creator_id = '558db810-ea7c-4c4b-9906-ef4a83dfec0a';

-- Delete duplicate creator's campaigns
DELETE FROM public.campaigns WHERE creator_id = '558db810-ea7c-4c4b-9906-ef4a83dfec0a';

-- Delete duplicate creator
DELETE FROM public.creators WHERE id = '558db810-ea7c-4c4b-9906-ef4a83dfec0a';
