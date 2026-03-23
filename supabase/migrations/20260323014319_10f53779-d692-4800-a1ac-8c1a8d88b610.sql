-- Update profile email and upgrade subscription to pro for admin user
UPDATE public.profiles SET email = 'gamacedo01@gmail.com' WHERE id = 'a9166f5e-4043-46c6-89d0-efbb582c8aa5';
UPDATE public.subscriptions SET plan = 'pro' WHERE agency_id = '3f6cd5ce-ff33-4350-beea-98443eb49928';
