-- RUN THIS IN SUPABASE SQL EDITOR
-- Create project_tags table
CREATE TABLE IF NOT EXISTS public.project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read tags" ON public.project_tags;
CREATE POLICY "Allow public read tags" ON public.project_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated tags" ON public.project_tags;
CREATE POLICY "Allow all for authenticated tags" ON public.project_tags FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial values
INSERT INTO public.project_tags (name, display_order)
VALUES 
  ('Poster', 1),
  ('Branding', 2),
  ('Logo Design', 3),
  ('UX/UI', 4)
ON CONFLICT (name) DO NOTHING;
