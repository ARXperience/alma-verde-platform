-- Enable the storage extension if not already enabled (usually enabled by default)
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- 1. Create project-renders bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-renders', 'project-renders', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create project-files bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false) -- Private bucket for project files
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Policies for project-renders (Public)
-- ==========================================

-- Allow Public Read Access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'project-renders' );

-- Allow Authenticated Users to Upload (Standard Users)
CREATE POLICY "Authenticated Users Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'project-renders' );

-- Allow Authenticated Users to Update/Delete their own (Optional, for now just Upload)
-- Service Role bypasses RLS automatically, but we ensure it here just in case custom auth is used
-- Note: Service Role (role 'service_role') has 'ALL' privileges by default in Supabase storage if no RLS blocks it explicitly.

-- ==========================================
-- Policies for project-files (Private)
-- ==========================================

-- Allow Authenticated Users to Upload
CREATE POLICY "Authenticated Upload Project Files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'project-files' );

-- Allow Users to View their own files (This is complex with folder structures, 
-- usually we handle download via signed URLs which bypass RLS for the download itself if created by admin/service_role
-- or if the user has permission to call createSignedUrl)

-- Grant usage on schemas
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres, anon, authenticated, service_role;
