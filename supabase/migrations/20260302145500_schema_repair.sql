-- Migration: Schema Repair and missing columns (V2)
-- This ensures that tables created before certain migrations have all required columns.

-- 1. Ensure 'name' exists on users
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE public.users ADD COLUMN name TEXT;
    END IF;
    
    -- If full_name exists, migrate it to name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
        UPDATE public.users SET name = full_name WHERE name IS NULL;
    END IF;
END $$;

-- 2. Ensure 'is_required' and 'points' exist on questions
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT TRUE;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1;

-- 3. Ensure 'allowed_tests_tags' and 'currency' exist on plans
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS allowed_tests_tags TEXT[] DEFAULT '{}';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'CAD';

-- 4. Align 'attempts' table columns
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS score_total INTEGER DEFAULT 0;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress';
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- If start_time exists and created_at just added, sync them
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attempts' AND column_name = 'start_time') THEN
        UPDATE public.attempts SET created_at = start_time WHERE created_at IS NULL OR created_at = start_time;
    END IF;
END $$;

-- 5. Ensure 'responses' has standard columns
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Ensure 'submission_reviews' has standard columns
ALTER TABLE public.submission_reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.submission_reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
