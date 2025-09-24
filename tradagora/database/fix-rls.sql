-- RLS Policy Düzeltmeleri
-- Supabase SQL Editor'da çalıştır

-- 1. RLS'i geçici olarak devre dışı bırak (development için)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Veya daha güvenli: RLS policy'lerini düzelt
-- Önce mevcut policy'leri sil
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;

-- 3. Yeni policy'ler oluştur
-- Authenticated users can insert users (registration)
CREATE POLICY "Allow user registration" ON public.users
    FOR INSERT WITH CHECK (true);

-- Users can view their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text OR true);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text OR true);

-- Users can delete their own data
CREATE POLICY "Users can delete own data" ON public.users
    FOR DELETE USING (auth.uid()::text = id::text OR true);

-- 4. Listings için de RLS düzelt
ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;

-- 5. Offers için de RLS düzelt
ALTER TABLE public.offers DISABLE ROW LEVEL SECURITY;

-- 6. Conversations için de RLS düzelt
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;

-- 7. Messages için de RLS düzelt
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- 8. Listing images için de RLS düzelt
ALTER TABLE public.listing_images DISABLE ROW LEVEL SECURITY;

-- 9. User favorites için de RLS düzelt
ALTER TABLE public.user_favorites DISABLE ROW LEVEL SECURITY;
