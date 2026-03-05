-- Migration: Add Missing Prompt Column to Questions
-- This ensures the 'prompt' column exists in the questions table.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'prompt') THEN
        ALTER TABLE public.questions ADD COLUMN prompt TEXT;
    END IF;

    -- Ensure 'type' exists as well, just in case
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'type') THEN
        ALTER TABLE public.questions ADD COLUMN type TEXT;
    END IF;
END $$;
