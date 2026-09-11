-- ============================================================
-- TOP BAR LOGOS & STORAGE BUCKET MIGRATION
-- Run this script in the Supabase SQL Editor.
-- ============================================================

-- 1. Create public storage bucket 'portal-logos' if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('portal-logos', 'portal-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage RLS Policies: Allow public read access to 'portal-logos'
DROP POLICY IF EXISTS "Public Access to portal-logos" ON storage.objects;
CREATE POLICY "Public Access to portal-logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'portal-logos');

-- Allow authenticated users to upload/modify logos in 'portal-logos'
DROP POLICY IF EXISTS "Authenticated users can upload portal-logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload portal-logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portal-logos');

DROP POLICY IF EXISTS "Authenticated users can update portal-logos" ON storage.objects;
CREATE POLICY "Authenticated users can update portal-logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portal-logos');

-- 3. Create top_bar_logos table
CREATE TABLE IF NOT EXISTS public.top_bar_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  file_name TEXT,              -- e.g. 'logo1.png', 'logo2.png' in portal-logos bucket
  logo_url TEXT,               -- Fallback or direct external image URL
  redirect_url TEXT NOT NULL,  -- Target redirect link
  sort_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.top_bar_logos ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so anonymous users visiting portal can see logos)
DROP POLICY IF EXISTS "Allow public read access on top_bar_logos" ON public.top_bar_logos;
CREATE POLICY "Allow public read access on top_bar_logos"
ON public.top_bar_logos FOR SELECT
USING (true);

-- Allow authenticated users to manage entries
DROP POLICY IF EXISTS "Allow authenticated users to manage top_bar_logos" ON public.top_bar_logos;
CREATE POLICY "Allow authenticated users to manage top_bar_logos"
ON public.top_bar_logos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Seed initial 4 logo slots
-- Note: Replace file_name with the exact filename uploaded to 'portal-logos' bucket,
-- or replace redirect_url with the preferred portal link.
INSERT INTO public.top_bar_logos (title, subtitle, file_name, redirect_url, sort_order, is_active)
VALUES
  (
    'Swachh Bharat Mission',
    'Ek Kadam Swachhata Ki Ore',
    'logo1.png',
    'https://swachhbharatmission.ddws.gov.in/',
    1,
    true
  ),
  (
    'Digital India',
    'Power To Empower',
    'logo2.png',
    'https://digitalindia.gov.in/',
    2,
    true
  ),
  (
    'Government of Uttarakhand',
    'Official State Portal',
    'logo3.png',
    'https://uk.gov.in/',
    3,
    true
  ),
  (
    'MyGov Uttarakhand',
    'Saath Aayein Desh Banayein',
    'logo4.png',
    'https://uttarakhand.mygov.in/',
    4,
    true
  )
ON CONFLICT DO NOTHING;
