-- Migration: Align Columns and ensure standard metadata
-- This migration ensures consistency across attempts, responses, and reviews.

-- 1. Ensure 'attempts' table has created_at/updated_at and score_total
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS score_total INTEGER DEFAULT 0;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress';
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Sync start_time to created_at if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attempts' AND column_name = 'start_time') THEN
        UPDATE public.attempts SET created_at = start_time WHERE created_at IS NULL OR created_at = start_time;
    END IF;
END $$;

-- 2. Ensure 'responses' has created_at/updated_at
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Ensure 'submission_reviews' has created_at/updated_at
ALTER TABLE public.submission_reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.submission_reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
