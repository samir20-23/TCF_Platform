-- ============================================================
-- 20260227170000_subscription_schema_fix.sql
-- Consolidates missing columns and repairs test access
-- ============================================================

-- 1. FIX PLANS TABLE
-- Adding missing columns to support dynamic plan management and PayPal
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS currency varchar DEFAULT 'MAD',
ADD COLUMN IF NOT EXISTS billing_type varchar DEFAULT 'one-time',
ADD COLUMN IF NOT EXISTS stripe_price_id varchar,
ADD COLUMN IF NOT EXISTS paypal_plan_id varchar,
ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Update existing plans with defaults if they were NULL
UPDATE public.plans SET currency = 'MAD', active = true WHERE currency IS NULL;

-- 2. FIX USERS TABLE (if status or role columns are missing/different)
-- The seed data uses 'users' table, and StudentDashboardPage queries it.
-- Ensure columns like target_score exist if needed (they were in databaseLooksLike.md)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'active',
ADD COLUMN IF NOT EXISTS target_score varchar,
ADD COLUMN IF NOT EXISTS study_goal varchar;

-- 3. DYNAMIC LINKING: Ensure every plan has tests in plan_tests
-- This links every plan to all currently published tests as a fallback
-- Using CROSS JOIN to link every active plan to every published test
INSERT INTO public.plan_tests (plan_id, test_id, max_attempts)
SELECT p.id, t.id, 5
FROM public.plans p
CROSS JOIN public.tests t
WHERE p.active = true AND t.published = true
ON CONFLICT DO NOTHING;

-- 4. REPAIR: Populate sub_test_access for active subscriptions that are empty
-- This is the "fix" for users who already paid but see nothing
INSERT INTO public.sub_test_access (subscription_id, plan_test_id, remaining_attempts)
SELECT s.id, pt.id, pt.max_attempts
FROM public.subscriptions s
JOIN public.plan_tests pt ON pt.plan_id = s.plan_id
WHERE s.status = 'active'
AND NOT EXISTS (
    SELECT 1 FROM public.sub_test_access sta WHERE sta.subscription_id = s.id
)
ON CONFLICT DO NOTHING;
