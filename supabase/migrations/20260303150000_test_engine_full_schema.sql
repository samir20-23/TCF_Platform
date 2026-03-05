-- Migration: Add missing columns for full test engine support
-- Resources: transcript, replay_limit, question_id, order_index, visibility
-- Tests: practice_mode
-- Questions: shuffle_options

DO $$
BEGIN

    -- RESOURCES TABLE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='transcript') THEN
        ALTER TABLE public.resources ADD COLUMN transcript TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='replay_limit') THEN
        ALTER TABLE public.resources ADD COLUMN replay_limit INTEGER DEFAULT 3;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='question_id') THEN
        ALTER TABLE public.resources ADD COLUMN question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='order_index') THEN
        ALTER TABLE public.resources ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='visibility') THEN
        ALTER TABLE public.resources ADD COLUMN visibility TEXT DEFAULT 'public';
    END IF;

    -- TESTS TABLE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tests' AND column_name='practice_mode') THEN
        ALTER TABLE public.tests ADD COLUMN practice_mode BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tests' AND column_name='visible_from') THEN
        ALTER TABLE public.tests ADD COLUMN visible_from TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tests' AND column_name='visible_until') THEN
        ALTER TABLE public.tests ADD COLUMN visible_until TIMESTAMP WITH TIME ZONE;
    END IF;

    -- QUESTIONS TABLE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='shuffle_options') THEN
        ALTER TABLE public.questions ADD COLUMN shuffle_options BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='resource_id') THEN
        ALTER TABLE public.questions ADD COLUMN resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL;
    END IF;

    -- SUBMISSION_REVIEWS TABLE — ensure it exists with needed columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='submission_reviews') THEN
        CREATE TABLE public.submission_reviews (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            attempt_id UUID REFERENCES public.attempts(id) ON DELETE CASCADE NOT NULL,
            question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
            q_type TEXT,
            content TEXT,
            media_url TEXT,
            word_count INTEGER,
            max_score INTEGER DEFAULT 1,
            score_final INTEGER,
            status TEXT DEFAULT 'pending',
            reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
            reviewer_comment TEXT,
            reviewed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(attempt_id, question_id)
        );

        -- Enable RLS
        ALTER TABLE public.submission_reviews ENABLE ROW LEVEL SECURITY;

        -- Admins can read all
        CREATE POLICY "Admins read all reviews"
            ON public.submission_reviews FOR SELECT
            TO authenticated
            USING (
                EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
            );

        -- Students read their own
        CREATE POLICY "Students read own reviews"
            ON public.submission_reviews FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.attempts a
                    WHERE a.id = attempt_id AND a.user_id = auth.uid()
                )
            );
    ELSE
        -- Add missing columns if table exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submission_reviews' AND column_name='q_type') THEN
            ALTER TABLE public.submission_reviews ADD COLUMN q_type TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submission_reviews' AND column_name='word_count') THEN
            ALTER TABLE public.submission_reviews ADD COLUMN word_count INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submission_reviews' AND column_name='max_score') THEN
            ALTER TABLE public.submission_reviews ADD COLUMN max_score INTEGER DEFAULT 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submission_reviews' AND column_name='reviewer_comment') THEN
            ALTER TABLE public.submission_reviews ADD COLUMN reviewer_comment TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submission_reviews' AND column_name='reviewed_at') THEN
            ALTER TABLE public.submission_reviews ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submission_reviews' AND column_name='status') THEN
            ALTER TABLE public.submission_reviews ADD COLUMN status TEXT DEFAULT 'pending';
        END IF;
    END IF;

END $$;
