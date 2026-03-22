-- 1. Create a temporary mapping of duplicate visitor_ids to the original (earliest) id
CREATE TEMP TABLE visitor_mapping AS
WITH visitor_groups AS (
    SELECT id, visitor_hash, 
           ROW_NUMBER() OVER(PARTITION BY visitor_hash ORDER BY created_at ASC) as rn,
           FIRST_VALUE(id) OVER(PARTITION BY visitor_hash ORDER BY created_at ASC) as original_id
    FROM visitors
)
SELECT id, original_id
FROM visitor_groups
WHERE rn > 1;

-- 2. Update page_views to point to the original visitor_id
UPDATE page_views
SET visitor_id = vm.original_id
FROM visitor_mapping vm
WHERE page_views.visitor_id = vm.id;

-- 3. Delete the duplicate visitors
DELETE FROM visitors
WHERE id IN (SELECT id FROM visitor_mapping);

-- 4. Add the unique constraint to prevent future duplicates
ALTER TABLE visitors ADD CONSTRAINT unique_visitor_hash UNIQUE (visitor_hash);

-- 5. Cleanup
DROP TABLE visitor_mapping;
