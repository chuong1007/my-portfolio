-- Thêm cột display_order vào bảng projects để sắp xếp thứ tự tùy ý
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Khởi tạo giá trị ban đầu theo thứ tự created_at (cũ nhất = 1, mới nhất = N)
UPDATE public.projects SET display_order = sub.rn
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn FROM public.projects) sub
WHERE public.projects.id = sub.id;
