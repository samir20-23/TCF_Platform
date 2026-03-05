-- Migration: Final Final Comprehensive Schema Alignment
-- This migration ensures ALL columns for questions, options, and tests are present.

DO $$ 
BEGIN
    -- 1. QUESTIONS TABLE
    -- Ensure columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'test_id') THEN
        ALTER TABLE public.questions ADD COLUMN test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'type') THEN
        ALTER TABLE public.questions ADD COLUMN type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'title') THEN
        ALTER TABLE public.questions ADD COLUMN title TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'prompt') THEN
        ALTER TABLE public.questions ADD COLUMN prompt TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'points') THEN
        ALTER TABLE public.questions ADD COLUMN points INTEGER DEFAULT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'is_required') THEN
        ALTER TABLE public.questions ADD COLUMN is_required BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'order_index') THEN
        ALTER TABLE public.questions ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'metadata') THEN
        ALTER TABLE public.questions ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'time_limit_seconds') THEN
        ALTER TABLE public.questions ADD COLUMN time_limit_seconds INTEGER;
    END IF;

    -- 2. QUESTION_OPTIONS TABLE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_options' AND column_name = 'question_id') THEN
        ALTER TABLE public.question_options ADD COLUMN question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_options' AND column_name = 'option_text') THEN
        ALTER TABLE public.question_options ADD COLUMN option_text TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_options' AND column_name = 'is_correct') THEN
        ALTER TABLE public.question_options ADD COLUMN is_correct BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_options' AND column_name = 'order_index') THEN
        ALTER TABLE public.question_options ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_options' AND column_name = 'pair_id') THEN
        ALTER TABLE public.question_options ADD COLUMN pair_id TEXT;
    END IF;

    -- 3. ATTEMPTS TABLE (Standardize timestamps)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attempts' AND column_name = 'started_at') THEN
        ALTER TABLE public.attempts ADD COLUMN started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attempts' AND column_name = 'end_at') THEN
        ALTER TABLE public.attempts ADD COLUMN end_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attempts' AND column_name = 'status') THEN
        ALTER TABLE public.attempts ADD COLUMN status TEXT DEFAULT 'in_progress';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attempts' AND column_name = 'score_total') THEN
        ALTER TABLE public.attempts ADD COLUMN score_total INTEGER DEFAULT 0;
    END IF;

    -- Handle mapping from old start_time/end_time if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attempts' AND column_name = 'start_time') THEN
        UPDATE public.attempts SET started_at = start_time WHERE started_at IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attempts' AND column_name = 'end_time') THEN
        UPDATE public.attempts SET end_at = end_time WHERE end_at IS NULL;
    END IF;

END $$;
