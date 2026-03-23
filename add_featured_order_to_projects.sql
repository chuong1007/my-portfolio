-- RUN THIS IN SUPABASE SQL EDITOR
-- Add featured_order to projects table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='featured_order') THEN
        ALTER TABLE public.projects ADD COLUMN featured_order INTEGER DEFAULT 0;
    END IF;
END $$;

COMMENT ON COLUMN public.projects.featured_order IS 'Thứ tự ưu tiên hiển thị của các bài ghim nổi bật (số càng nhỏ càng ở trên đầu)';
