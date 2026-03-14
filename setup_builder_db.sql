-- Tạo bảng pages để lưu trữ nội dung UX Builder
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT,
    page_content JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách cho phép mọi người xem trang (Read Access)
CREATE POLICY "Allow public read access on pages" 
ON pages FOR SELECT 
TO public 
USING (true);

-- Tạo chính sách cho phép (Service Role hoặc Authenticated) sửa đổi
-- Lưu ý: Trong môi trường dev này, tôi sẽ mở cho phép mọi người INSERT/UPDATE để tiện demo. 
-- Trong thực tế nên giới hạn cho authenticated users.
CREATE POLICY "Allow public insert/update access for demo" 
ON pages FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- Chèn một trang mặc định cho home-2 nếu chưa có
INSERT INTO pages (slug, title, page_content) 
VALUES ('home-2', 'Home Page 2', '[]'::jsonb)
ON CONFLICT (slug) DO NOTHING;
