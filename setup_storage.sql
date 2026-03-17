-- SUPABASE STORAGE SETUP
-- Run this in your Supabase SQL Editor to fix image upload issues

-- 1. Create the bucket if it doesn't exist
-- Note: Supabase UI is recommended for this, but SQL works too
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to read files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'project-images' );

-- 3. Allow authenticated users to upload files
-- This is necessary for the admin panel to work
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'project-images' );

-- 4. Allow authenticated users to update/delete their files
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'project-images' );

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'project-images' );

-- 5. Optional: Allow anonymous uploads for demo (ONLY if you haven't set up auth properly)
-- Uncomment the lines below if you are still having issues while logged in
-- CREATE POLICY "Anon Upload"
-- ON storage.objects FOR INSERT
-- TO public
-- WITH CHECK ( bucket_id = 'project-images' );
