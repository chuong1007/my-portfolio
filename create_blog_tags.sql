CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách cho phép mọi người xem (Read Access)
DROP POLICY IF EXISTS "Allow public read access on blog_tags" ON blog_tags;
CREATE POLICY "Allow public read access on blog_tags" 
ON blog_tags FOR SELECT 
TO public 
USING (true);

-- Cho phép sửa đổi cho việc demo (hoặc hạn chế role)
DROP POLICY IF EXISTS "Allow public all access for blog_tags" ON blog_tags;
CREATE POLICY "Allow public all access for blog_tags" 
ON blog_tags FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

