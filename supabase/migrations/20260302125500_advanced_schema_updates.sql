-- Migration: Add advanced fields to plans, tests, questions, and attempts

-- 1. Plans table enhancements
ALTER TABLE plans ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'CAD';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS allowed_tests_tags TEXT[] DEFAULT '{}';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS attempts_allowed INTEGER DEFAULT 3;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT FALSE;

-- 2. Tests table enhancements
ALTER TABLE tests ADD COLUMN IF NOT EXISTS section_type TEXT; -- listening, reading, writing, speaking, mixed
ALTER TABLE tests ADD COLUMN IF NOT EXISTS practice_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS visible_from TIMESTAMP WITH TIME ZONE;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS visible_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE tests ADD COLUMN IF NOT EXISTS difficulty TEXT; -- A1, A2, B1, B2, C1, C2
ALTER TABLE tests ADD COLUMN IF NOT EXISTS replay_limit INTEGER DEFAULT 1; -- For listening exam mode

-- 3. Questions table enhancements
ALTER TABLE questions ADD COLUMN IF NOT EXISTS shuffle_options BOOLEAN DEFAULT FALSE;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS rubric JSONB DEFAULT '{}'; -- Criteria, sample answers, etc.
ALTER TABLE questions ADD COLUMN IF NOT EXISTS recording_max_seconds INTEGER;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS allow_rerecord BOOLEAN DEFAULT TRUE;

-- 4. Attempts table enhancements
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS session_token TEXT;
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id); -- link to sub if available

-- 5. Audit logs (actions table already exists, but let's ensure it has IP and User Agent)
-- (It already has them based on previous view_file of database.types.ts)
