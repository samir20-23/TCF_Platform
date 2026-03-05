-- ============================================================
-- TCF Exam Engine Migration – 2026-03-01
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Extend attempts table with exam-engine columns
ALTER TABLE public.attempts
  ADD COLUMN IF NOT EXISTS session_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS answer_data JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_saved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_submitted BOOLEAN NOT NULL DEFAULT false;

-- 2. Extend questions table with type-specific payload
-- extra_payload stores:  transcript, passage_text, rubric, sample_answer,
--                        min_words, max_words, replay_limit, max_recording_sec
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS extra_payload JSONB NOT NULL DEFAULT '{}';

-- 3. Ensure tests table has required columns
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS test_type TEXT DEFAULT 'mixed',
  ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3;

-- 4. Ensure questions table has q_type (in case it uses 'type' column)
-- Alias: some routes query q_type, schema might have 'type' -- we keep both
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS q_type TEXT DEFAULT 'mcq';

-- 5. Create submission_reviews table for writing/speaking manual grading queue
CREATE TABLE IF NOT EXISTS public.submission_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  q_type TEXT NOT NULL,
  content TEXT,
  media_url TEXT,
  word_count INTEGER,
  reviewer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  score NUMERIC(5, 2),
  max_score NUMERIC(5, 2),
  feedback TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_sub_reviews_attempt  ON public.submission_reviews(attempt_id);
CREATE INDEX IF NOT EXISTS idx_sub_reviews_question ON public.submission_reviews(question_id);
CREATE INDEX IF NOT EXISTS idx_sub_reviews_reviewer ON public.submission_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_sub_reviews_unscored ON public.submission_reviews(reviewer_id) WHERE reviewer_id IS NULL;

-- 6. Row Level Security for submission_reviews
ALTER TABLE public.submission_reviews ENABLE ROW LEVEL SECURITY;

-- Admins/instructors can read and update all
CREATE POLICY IF NOT EXISTS "admin_all_sub_reviews"
  ON public.submission_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
        AND up.role IN ('admin', 'instructor')
    )
  );

-- Students can see their own submission_reviews (read only)
CREATE POLICY IF NOT EXISTS "student_read_own_sub_reviews"
  ON public.submission_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.attempts a
      WHERE a.id = submission_reviews.attempt_id
        AND a.user_id = auth.uid()
    )
  );

-- 7. Index attempts.end_at for timer queries
CREATE INDEX IF NOT EXISTS idx_attempts_end_at ON public.attempts(end_at);
CREATE INDEX IF NOT EXISTS idx_attempts_session_token ON public.attempts(session_token);
