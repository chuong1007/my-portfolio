-- SQL SCRIPT: Chuẩn bị cho Incremental Backup
-- Chạy script này trong Supabase SQL Editor để đảm bảo mọi bảng đều có `updated_at` và tự động cập nhật.

-- 1. Bổ sung cột updated_at cho các bảng còn thiếu
ALTER TABLE public.project_images ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Tạo hàm để tự động cập nhật timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Gắn trigger cho các bảng quan trọng
DO $$
BEGIN
    -- Bảng blogs
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_blogs_updated_at') THEN
        CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;

    -- Bảng projects
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;

    -- Bảng project_images
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_images_updated_at') THEN
        CREATE TRIGGER update_project_images_updated_at BEFORE UPDATE ON public.project_images FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;

    -- Bảng pages
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pages_updated_at') THEN
        CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;

    -- Bảng site_content
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_content_updated_at') THEN
        CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;
