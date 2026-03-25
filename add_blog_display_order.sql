-- Add display_order column to blogs table
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Set initial display_order based on current sort order (featured first, then by date)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY is_featured DESC, created_at DESC) as rn
  FROM blogs
)
UPDATE blogs SET display_order = ranked.rn
FROM ranked WHERE blogs.id = ranked.id AND blogs.display_order = 0;
