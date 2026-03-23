-- Add gallery_title and gallery_bottom_content to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS gallery_title TEXT DEFAULT 'Hình ảnh dự án',
ADD COLUMN IF NOT EXISTS gallery_bottom_content TEXT DEFAULT '';

-- Comments
COMMENT ON COLUMN public.projects.gallery_title IS 'Tiêu đề cho bộ sưu tập ảnh';
COMMENT ON COLUMN public.projects.gallery_bottom_content IS 'Nội dung hiển thị phía dưới bộ sưu tập ảnh (Rich Text)';
