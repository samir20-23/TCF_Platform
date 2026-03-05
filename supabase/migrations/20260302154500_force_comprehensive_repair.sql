-- Migration: Final Comprehensive Schema Repair (V3)
-- This ensures that questions and question_options tables have ALL required columns.

-- 1. QUESTIONS TABLE REPAIR
DO $$ 
BEGIN
    -- Ensure columns exist in questions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'title') THEN
        ALTER TABLE public.questions ADD COLUMN title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'points') THEN
        ALTER TABLE public.questions ADD COLUMN points INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'is_required') THEN
        ALTER TABLE public.questions ADD COLUMN is_required BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'time_limit_seconds') THEN
        ALTER TABLE public.questions ADD COLUMN time_limit_seconds INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'order_index') THEN
        ALTER TABLE public.questions ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'metadata') THEN
        ALTER TABLE public.questions ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'created_at') THEN
        ALTER TABLE public.questions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'updated_at') THEN
        ALTER TABLE public.questions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. QUESTION_OPTIONS TABLE REPAIR
DO $$ 
BEGIN
    -- Ensure columns exist in question_options
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_options' AND column_name = 'option_text') THEN
        ALTER TABLE public.question_options ADD COLUMN option_text TEXT;
    END IF;

    -- If another version of the table exists (like 'options')
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'options') THEN
        -- Optionally migrate or just leave it. We use question_options.
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_options' AND column_name = 'is_correct') THEN
        ALTER TABLE public.question_options ADD COLUMN is_correct BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_options' AND column_name = 'order_index') THEN
        ALTER TABLE public.question_options ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_options' AND column_name = 'created_at') THEN
        ALTER TABLE public.question_options ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_options' AND column_name = 'updated_at') THEN
        ALTER TABLE public.question_options ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. ENSURE OTHER CORE INFRASTRUCTURE
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS score_total INTEGER DEFAULT 0;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress';
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Also ensure 'users' has 'name' which we standardized
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
        UPDATE public.users SET name = full_name WHERE name IS NULL;
    END IF;
END $$;
