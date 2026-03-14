-- RUN THIS IN SUPABASE SQL EDITOR TO SETUP PROJECTS TABLE
-- 1. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create project_images table (Gallery)
CREATE TABLE IF NOT EXISTS public.project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Allow anyone to read
DROP POLICY IF EXISTS "Allow public read projects" ON public.projects;
CREATE POLICY "Allow public read projects" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read project_images" ON public.project_images;
CREATE POLICY "Allow public read project_images" ON public.project_images FOR SELECT USING (true);

-- Allow admins (authenticated) full access
DROP POLICY IF EXISTS "Allow all for authenticated projects" ON public.projects;
CREATE POLICY "Allow all for authenticated projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated project_images" ON public.project_images;
CREATE POLICY "Allow all for authenticated project_images" ON public.project_images FOR ALL USING (auth.role() = 'authenticated');
