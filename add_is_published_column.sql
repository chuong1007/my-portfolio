-- Thêm cột is_published vào bảng blogs nếu chưa tồn tại
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Cập nhật tất cả bài viết hiện tại thành true
UPDATE blogs SET is_published = true WHERE is_published IS NULL;
