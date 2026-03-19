-- consolidated_fix_db.sql
-- Run this in your Supabase SQL Editor to fix all missing columns and table issues

-- 1. Ensure blogs table has all required columns
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    excerpt TEXT,
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    custom_css TEXT DEFAULT '',
    custom_html TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns to blogs if they were created with old scripts
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS custom_css TEXT DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS custom_html TEXT DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Ensure projects table has all required columns
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    cover_image TEXT,
    is_visible BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Ensure project_images table exists
CREATE TABLE IF NOT EXISTS public.project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Set RLS Policies (Allow public read, authenticated write)
-- Blogs
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Blogs" ON public.blogs;
CREATE POLICY "Public Read Blogs" ON public.blogs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Blogs" ON public.blogs;
CREATE POLICY "Admin All Blogs" ON public.blogs FOR ALL USING (auth.role() = 'authenticated');

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Projects" ON public.projects;
CREATE POLICY "Public Read Projects" ON public.projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Projects" ON public.projects;
CREATE POLICY "Admin All Projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');

-- Project Images
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Project Images" ON public.project_images;
CREATE POLICY "Public Read Project Images" ON public.project_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Project Images" ON public.project_images;
CREATE POLICY "Admin All Project Images" ON public.project_images FOR ALL USING (auth.role() = 'authenticated');
