CREATE TABLE IF NOT EXISTS page_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Enable read access for all users" ON page_templates
  FOR SELECT USING (true);

-- Insert policy (Admin only - simplified for now)
CREATE POLICY "Enable all access for admin" ON page_templates
  FOR ALL USING (true);
