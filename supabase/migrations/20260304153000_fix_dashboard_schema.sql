-- Migration to fix dashboard schema mismatches
-- Adds missing columns reported as missing in schema cache

-- 1. Fix tests table
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'B2';

-- 2. Fix submission_reviews table
ALTER TABLE public.submission_reviews 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_final INTEGER DEFAULT 0;

-- 3. Ensure attempts finished_at is used (already standardized in code but good for schema sanity)
-- No changes needed here if finished_at already exists.

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';
