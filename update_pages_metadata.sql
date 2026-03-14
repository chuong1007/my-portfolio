-- Nâng cấp bảng pages để hỗ trợ CMS
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_in_header BOOLEAN DEFAULT FALSE;

-- Cập nhật tiêu đề mặc định cho các trang hiện có nếu cần
UPDATE pages SET title = slug WHERE title IS NULL;

-- Đảm bảo RLS cho phép các thao tác mới
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Policy cho phép mọi người xem trang đã publish
CREATE POLICY "Public pages are viewable by everyone" 
ON pages FOR SELECT 
USING (is_published = true);

-- Policy cho phép admin quản lý mọi thứ (Giả sử có role authenticated)
CREATE POLICY "Authenticated users can manage all pages" 
ON pages FOR ALL 
USING (auth.role() = 'authenticated');
