-- Backfill creators missing agency_id
UPDATE public.creators c
SET agency_id = a.id
FROM public.agencies a
WHERE a.owner_id = c.user_id
  AND c.agency_id IS NULL;