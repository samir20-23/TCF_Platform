-- ==========================================
-- CRITICAL SCHEMA FIXES - RUN IN SUPABASE DASHBOARD
-- ==========================================
-- 
-- Instructions:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to "SQL Editor" in the left sidebar
-- 4. Paste this entire script and click "Run"
-- ==========================================

-- Fix 1: Add missing columns to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS required_subscription TEXT DEFAULT 'Gratuit';

ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS subscription_required BOOLEAN DEFAULT false;

-- Fix 2: Ensure user_profiles has updated_at column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Fix 3: Ensure lessons table has all needed status/type columns
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 15;

ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Débutant (A1-A2)';

ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'READING';

-- Fix 4: Sync existing data
UPDATE public.lessons 
SET required_subscription = 'Gratuit' 
WHERE required_subscription IS NULL;

UPDATE public.lessons 
SET is_published = COALESCE(published, false) 
WHERE is_published IS NULL;

UPDATE public.lessons 
SET type = 'READING'
WHERE type IS NULL;

UPDATE public.lessons 
SET difficulty = 'Débutant (A1-A2)'
WHERE difficulty IS NULL;

-- Fix 5: Enable cascade delete for lessons when course is deleted
-- First check if constraint exists, if so drop and recreate
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'lessons_course_id_fkey'
    ) THEN
        ALTER TABLE public.lessons DROP CONSTRAINT lessons_course_id_fkey;
    END IF;
END $$;

ALTER TABLE public.lessons 
ADD CONSTRAINT lessons_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Fix 6: Ensure subscriptions table allows upsert on user_id
-- Add unique constraint if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_key'
    ) THEN
        -- Check for duplicates first
        DELETE FROM public.subscriptions a
        USING public.subscriptions b
        WHERE a.id < b.id AND a.user_id = b.user_id;
        
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Fix 7: Update RLS policies for admin operations on courses
DROP POLICY IF EXISTS "Admin can delete courses" ON public.courses;
CREATE POLICY "Admin can delete courses" ON public.courses
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'instructor')
    )
);

DROP POLICY IF EXISTS "Admin can update courses" ON public.courses;
CREATE POLICY "Admin can update courses" ON public.courses
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'instructor')
    )
);

-- Fix 8: Ensure lessons RLS allows admin operations
DROP POLICY IF EXISTS "Admin can delete lessons" ON public.lessons;
CREATE POLICY "Admin can delete lessons" ON public.lessons
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'instructor')
    )
);

-- Success message
SELECT 'All schema fixes applied successfully!' as result;
