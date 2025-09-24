-- RLS'i tamamen devre dışı bırak (development için)
-- Supabase SQL Editor'da çalıştır

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites DISABLE ROW LEVEL SECURITY;

-- Tüm tablolar için RLS devre dışı
SELECT 'RLS disabled for all tables' as status;
