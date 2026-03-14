-- SUPABASE DATABASE SETUP
-- Copy and run this in your Supabase SQL Editor

-- 1. Create site_content table
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 3. Create Security Policies
-- Allow anyone to read the content
DROP POLICY IF EXISTS "Allow public read access" ON public.site_content;
CREATE POLICY "Allow public read access" ON public.site_content FOR SELECT USING (true);

-- Allow authenticated admins to full access (upsert/update/delete)
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.site_content;
CREATE POLICY "Allow all access for authenticated users" ON public.site_content FOR ALL USING (auth.role() = 'authenticated');

-- 4. Initial Seed Data (Optional but recommended)
INSERT INTO public.site_content (id, data) 
VALUES 
('hero', '{"title": "Visual Designer based in Ho Chi Minh City", "subtitle": "Scroll to explore"}'),
('about', '{"heading": "About", "subheading": "Senior Graphic Designer | 7 Years of Experience", "paragraphs": ["Chuyên gia thiết kế với hơn 7 năm..."] }'),
('contact', '{"heading": "Let''s Connect", "subtitle": "Anh/ chị có dự án cần thực hiện:", "phone": "038 429 7019", "email": "chuong.thanh1007@gmail.com"}')
ON CONFLICT (id) DO NOTHING;
