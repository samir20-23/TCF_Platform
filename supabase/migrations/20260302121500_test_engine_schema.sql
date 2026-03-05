-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enum for Question Types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
        CREATE TYPE question_type AS ENUM (
            'singleChoice', 
            'multipleChoice', 
            'trueFalse', 
            'shortText', 
            'longText', 
            'fileUpload', 
            'speaking', 
            'matching', 
            'ordering'
        );
    END IF;
END $$;

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    type question_type NOT NULL,
    title TEXT,
    prompt TEXT NOT NULL,
    points INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    time_limit_seconds INTEGER,
    order_index INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}', -- For matching (pairs), ordering (correct order)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Question Options (for MCQ, Matching)
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    pair_id TEXT -- For matching questions (match option to a key)
);

-- 4. Student Attempts
CREATE TABLE IF NOT EXISTS attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress', -- in_progress, submitted, pending_review, completed
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    score_total INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}' -- Store things like 'is_proctored', 'browser_info'
);

-- 5. Student Responses
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    content JSONB, -- Store text answer, selected option IDs, or ordering array
    file_url TEXT, -- For fileUpload and speaking
    is_correct BOOLEAN,
    score_awarded INTEGER DEFAULT 0,
    feedback TEXT,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_attempt_id ON responses(attempt_id);
