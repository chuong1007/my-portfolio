-- RUN THIS IN SUPABASE SQL EDITOR
-- Add gallery_columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS gallery_columns INTEGER DEFAULT 4;

-- Comment to explain the column
COMMENT ON COLUMN public.projects.gallery_columns IS 'Số lượng cột hiển thị trong bộ sưu tập ảnh của dự án (mặc định là 4)';
