-- Migration: Add Missing Dashboard Columns to Users
-- Description: Adds points, current_streak_days, target_score, and study_goal to the users table.

DO $$ 
BEGIN
    -- Add points column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points') THEN
        ALTER TABLE public.users ADD COLUMN points INTEGER DEFAULT 0;
    END IF;

    -- Add current_streak_days column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_streak_days') THEN
        ALTER TABLE public.users ADD COLUMN current_streak_days INTEGER DEFAULT 0;
    END IF;

    -- Add target_score column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'target_score') THEN
        ALTER TABLE public.users ADD COLUMN target_score TEXT;
    END IF;

    -- Add study_goal column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'study_goal') THEN
        ALTER TABLE public.users ADD COLUMN study_goal TEXT;
    END IF;
END $$;
