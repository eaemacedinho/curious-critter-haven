UPDATE public.plan_limits SET max_creators = 2 WHERE plan = 'pro';
UPDATE public.plan_limits SET max_creators = 10 WHERE plan = 'scale';