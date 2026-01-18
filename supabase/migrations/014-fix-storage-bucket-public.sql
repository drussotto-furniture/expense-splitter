-- Make the receipts bucket public so images can be viewed
-- This allows authenticated users to view receipt images without complex URL signing

UPDATE storage.buckets
SET public = true
WHERE id = 'receipts';
